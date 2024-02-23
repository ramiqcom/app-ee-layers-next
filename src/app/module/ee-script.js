// Import important package
import 'node-self';
import ee from '@google/earthengine';
import Layer from './layers';
import satellites from '../data/satellite.json' assert { type: 'json' };
import visual from '../data/visual.json' assert { type: 'json' };
import { bbox, bboxPolygon } from '@turf/turf';

/**
 * Function to generate earth engine layer
 * @param {Object} body
 * @param {FeatureCollection} body.bounds
 * @param {[ String, String ]} body.date
 * @param {String} body.method
 * @param {String} body.layer 
 * @param {Response} res 
 */
export default async function generateLayer(body) {
	try {
		// Destructure body
		const { geojson, date, method, layer, satellite } = body;

		if (new Date(date[0]).getTime() > new Date(date[1]).getTime()) {
			throw new Error('Start date should be before the end date');
		}
		
		// Date
		const [ start, end ] = date;

		// Generate bbox polygon
		const bboxGeojson = bboxPolygon(bbox(geojson)).geometry;

		// Satellite data
		if (!satellites[satellite]) {
			throw new Error('That satellite id is not available')
		}

		// Destructure satellite object properties
		const {
			collection: satelliteCollection,
			cloud: satelliteCloud,
			bands: satelliteBands
		} = satellites[satellite];

		// Authenticate
		await authenticate();

		// Geometry object
		const bounds = ee.Geometry(bboxGeojson);

		// Call and filter the collection
		const col = ee.ImageCollection(ee.FeatureCollection(satelliteCollection.map(id => ee.ImageCollection(id).filterBounds(bounds).filterDate(start, end))).flatten());

		// Empty image
		let image;

		// Cloud mask function
		const cloudMask = {
			landsat: cloudMaskLandsat,
			s2: cloudMaskS2
		};

		// Get image based on method
		switch (method) {
			case 'composite':
				image = col.map(cloudMask[satellite]).median();
				break;
			case 'cloudless':
			case 'latest':
				image = col.sort(method == 'cloudless' ? satelliteCloud: 'system:time_start').first();
				break;
			default:
				throw new Error('That image generation is not available');
		}

		// Set image as ee.image
		image = ee.Image(image);

		// Clip the image
		image = image.clip(bounds.buffer(1e4, 1e4).bounds());

		// Layer selection
		const { layerImage, bands, palette } = layerSelection(image, satelliteBands, layer);

		// Visualize image
		const { visualized, vis } = visualize(layerImage, bands, palette, bounds);

		// Get image map id
		const { urlFormat } = await getMapId(visualized, {});

		// Thumbnail
		const thumb = await getThumbURL(visualized, bounds);

		// Result
		const result = {
			tile_url: urlFormat,
			download_url: thumb,
			vis: await evaluate(vis)
		};

		return { result: result, ok: true };
	} catch (error) {
		return { result: { message: error.message }, ok: false }
	}
}

/**
 * Function to authenticate EE
 * @returns {Promise.<Void>}
 */
function authenticate() {
	const key = JSON.parse(process.env.EE_KEY);
	return new Promise((resolve, reject) => {
		ee.data.authenticateViaPrivateKey(
			key,
			() => ee.initialize(null, null, () => resolve(), error => reject(new Error(error))),
			error => reject(new Error(error))
		);
	});
}

/**
 * Function to evaluate ee object
 * @param {ee.Element} element
 * @returns {Promise.<any>}
 */
export function evaluate(element) {
	return new Promise((resolve, reject) => {
		element.evaluate((data, error) => error ? reject(new Error(error)) : resolve(data));
	});
}

/**
 * Function to generate image url
 * @param {ee.Image | ee.FeatureCollection} data
 * @param {Object | ee.Dictionary} vis
 * @returns {Promise.<Object>}
 */
function getMapId(data, vis) {
	return new Promise((resolve, reject) => {
		data.getMapId(vis, (object, error) => error ? reject(new Error(error)) : resolve(object));
	});
}

/**
 * Function to generate image thumbnail url
 * @param {ee.Image} image
 * @param {ee.Geometry} bounds
 * @returns {Promise.<String>}
 */
function getThumbURL(image, bounds) {
	const params = {
		dimensions: 800,
		region: bounds,
	};

	return new Promise((resolve, reject) => {
		image.getThumbURL(params, (object, error) => error ? reject(new Error(error)) : resolve(object));
	});
}

/**
 * Function to generate image layer
 * @param {ee.Image} image
 * @param {Object.<Band>} bands
 * @param {String} layer
 * @returns {{ image: ee.Image, bands: Array.<String>, palette: Array.<String> }}
 */
function layerSelection(image, bands, layer) {
	// Layer check
	if (!visual[layer]) {
		throw new Error('That visualization is is not available')
	}

	// Selected visualization pro
	const visProp = visual[layer];

	// Bands and layers
	let layerBands;
	let layerImage;
	let palette;

	// Switch for layer
	switch (visProp.type) {
		case 'indices':
			layerBands = visProp.bands;
			const keys = Object.keys(bands);
			const values = Object.values(bands).map((band, index) => [ keys[index], image.select(band) ]);
			const dict = Object.fromEntries(values);
			layerImage = image.expression(visProp.formula, dict);
			palette = visProp.palette;
			break;
		case 'composite':
			layerBands = visProp.bands.map(name => bands[name]);
			layerImage = image.select(layerBands);
			break;
		default:
			layerBands = visProp.bands;
			layerImage = Layer[layer](image);
			palette = visProp.palette;
			break;
	}

	return { layerImage, bands: layerBands, palette }
}

/**
 * Function to visualize image
 * @param {ee.Image} image
 * @param {[ String, String, String ]} bands
 * @param {ee.Geometry} bounds
 * @returns {{ visualized: ee.Image, vis: ee.Dictionary.<{ bands: Array.<String>, min: Array.<Number>, max: Array.<Number>, palette: ?Array.<String> }> }}
 */
function visualize(image, bands, palette, bounds) {
	// Calculate the percentile value of the image
	const percentile = image.select(bands).reduceRegion({
		geometry: bounds,
		reducer: ee.Reducer.percentile([0.1, 99.9]),
		scale: 1000,
		maxPixels: 1e13,
	});

	// Get max values
	const max = bands.map(band => percentile.get(`${band}_p100`));

	// Get min values
	const min = bands.map(band => percentile.get(`${band}_p0`));

	// Dictionary of visualization
	const vis = { bands, max, min, palette: palette || null };

	// Visualized image
	return { visualized: image.visualize(vis), vis: ee.Dictionary(vis) };
}

/**
 * Function for cloudmasking landsat
 * @param {ee.Image} image
 * @returns {ee.Image}
 */
function cloudMaskLandsat(image) {
	image = ee.Image(image);
	const qa = image.select(['QA_PIXEL']);
	const mask = ee.ImageCollection([1, 2, 3, 4].map(num => qa.bitwiseAnd(1 << num).eq(0))).reduce(ee.Reducer.allNonZero());
	return image.select(['SR_B.*', 'ST_B.*']).updateMask(mask);
}

/**
 * Function for cloudmasking sentinel2
 * @param {ee.Image} image
 * @returns {ee.Image}
 */
function cloudMaskS2(image) {
	image = ee.Image(image);
	const scl = image.select('SCL');
	const mask = scl.eq(3).or(scl.gte(7).and(scl.lte(10))).eq(0);
	return image.select(['B.*']).updateMask(mask);
}