// Import all layers package
import ee from '@google/earthengine';
import satellites from '../data/satellite.json' assert { type: 'json' };
import shub from '../data/shub.json' assert { type: 'json' }

//VERSION=3 (auto-converted from 2)
const degToRad = Math.PI / 180;

/**
 * Function to create layer like sentinel hub
 * @param {String} id
 * @param {ee.Image} image
 * @returns {ee.Image}
 */
export default function layerCreation(image, id){
	// Normalized bands
	const normalizedBands = normalizingBands(image);

	// Load properties
	const { neurons, layer2, denormalizeValue, name } = shub[id];

	// Neurons image
	const neuronsImage = neurons.map((formula, index) => {
		const sum = ee.Image().expression(formula, normalizedBands);
  	return [ `neuron${index + 1}`, tansig(sum) ];
	});

	// Neurons image as dictiionary
	const neuronsObject = Object.fromEntries(neuronsImage);

	// Layer2
	const layer2Image = ee.Image().expression(layer2, neuronsObject);

	// Denormalize image
	const denormalized = denormalize(layer2Image, denormalizeValue[0], denormalizeValue[1]);

	// Rename image
	let renamed = denormalized.rename(name);

	// Condition for LAI
	switch (id) {
		case 'lai':
			renamed = renamed.divide(3);
			break;
		case 'ccc':
			const lai = layerCreation(image, 'lai').multiply(3);
			renamed = renamed.multiply(lai).divide(900);
			break;
	}

	// Return image
	return renamed
}

/**
 * Normalizing many bands
 * @param {ee.Image} image
 * @returns {{
 * 	b03_norm: ee.Image, 
 * 	b04_norm: ee.Image, 
 * 	b05_norm: ee.Image, 
 * 	b06_norm: ee.Image, 
 * 	b07_norm: ee.Image, 
 * 	b8a_norm: ee.Image, 
 * 	b11_norm: ee.Image, 
 * 	b12_norm: ee.Image, 
 * 	viewZen_norm: ee.Image, 
 * 	sunZen_norm: ee.Image, 
 * 	relAzim_norm: ee.Image
 * }}
 */
function normalizingBands(image){
	// Bands list
	const bands = Object.values(satellites.s2.bands);

	// Image sample object
	const B03 = image.select('B3');
	const	B04 = image.select('B4');
	const	B05 = image.select('B5');
	const B06 = image.select('B6');
	const B07 = image.select('B7');
	const B8A = image.select('B8A');
	const B11 = image.select('B11');
	const B12 = image.select('B12');
	const viewZenithMean = ee.Image(ee.Number((ee.List(bands.map(band => image.get(`MEAN_INCIDENCE_ZENITH_ANGLE_${band}`))).reduce(ee.Reducer.mean()))));
	const viewAzimuthMean = ee.Image(ee.Number(ee.List(bands.map(band => image.get(`MEAN_INCIDENCE_AZIMUTH_ANGLE_${band}`))).reduce(ee.Reducer.mean())));
	const sunZenithAngles = ee.Image(ee.Number(image.get('MEAN_SOLAR_ZENITH_ANGLE')));
	const sunAzimuthAngles = ee.Image(ee.Number(image.get('MEAN_SOLAR_AZIMUTH_ANGLE')));

	// Processing
  const b03_norm = normalize(B03, 0, 0.253061520471542);
  const b04_norm = normalize(B04, 0, 0.290393577911328);
  const b05_norm = normalize(B05, 0, 0.305398915248555);
  const b06_norm = normalize(B06, 0.006637972542253, 0.608900395797889);
  const b07_norm = normalize(B07, 0.013972727018939, 0.753827384322927);
  const b8a_norm = normalize(B8A, 0.026690138082061, 0.782011770669178);
  const b11_norm = normalize(B11, 0.016388074192258, 0.493761397883092);
  const b12_norm = normalize(B12, 0, 0.493025984460231);
  const viewZen_norm = normalize(viewZenithMean.multiply(degToRad).cos(), 0.918595400582046, 1);
  const sunZen_norm  = normalize(sunZenithAngles.multiply(degToRad).cos(), 0.342022871159208, 0.936206429175402);
  const relAzim_norm = sunAzimuthAngles.subtract(viewAzimuthMean).multiply(degToRad).cos();

	return {
		b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm
	};
}

/**
 * Normalize
 * @param {ee.Image} unnormalized
 * @param {Number} min
 * @param {Number} max 
 * @returns {ee.Image}
 */
export function normalize(unnormalized, min, max) {
	return unnormalized.expression('2 * (unnormalized - min) / (max - min) - 1', {
		unnormalized,
		min,
		max
	});
}

/**
 * Denormalize
 * @param {ee.Image} normalized
 * @param {Number} min
 * @param {Number} max 
 * @returns {ee.Image}
 */
export function denormalize(normalized, min, max) {
	return normalized.expression('0.5 * (normalized + 1) * (max - min) + min', {
		normalized,
		min,
		max
	});
}

/**
 * Calculate Tansig
 * @param {ee.Image} input 
 * @returns {ee.Image}
 */
export function tansig(input) {
	return input.expression('2 / (1 + E ** (-2 * input)) - 1', {
		input,
		E: Math.E
	});
}