import ee from '@google/earthengine';
import satellites from '../data/satellite.json' assert { type: 'json' };
import { evaluate } from './ee-script';

//VERSION=3 (auto-converted from 2)
const degToRad = Math.PI / 180;

/**
 * LAI function
 * @param {ee.Image} image 
 * @returns {ee.Image}
 */
export function lai(image) {
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


	// Neuron
  const n1 = neuron1(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm);
  const n2 = neuron2(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm);
  const n3 = neuron3(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm);
  const n4 = neuron4(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm);
  const n5 = neuron5(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm);


	// Layer data
  const l2 = layer2(n1, n2, n3, n4, n5);

	// LAI
  const lai = denormalize(l2, 0.000319182538301, 14.4675094548151);

  return lai.divide(3).rename('LAI');
}

/**
 * Neuron 1
 * @param {ee.Image} b03_norm
 * @param {ee.Image} b04_norm
 * @param {ee.Image} b05_norm
 * @param {ee.Image} b06_norm
 * @param {ee.Image} b07_norm
 * @param {ee.Image} b8a_norm
 * @param {ee.Image} b11_norm
 * @param {ee.Image} b12_norm
 * @param {ee.Image} viewZen_norm
 * @param {ee.Image} sunZen_norm
 * @param {ee.Image} relAzim_norm
 * @returns {ee.Image}
 */
function neuron1(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm) {
	const sum = ee.Image().expression(`
		+ 4.96238030555279
		- 0.023406878966470 * b03_norm
		+ 0.921655164636366 * b04_norm
		+ 0.135576544080099 * b05_norm
		- 1.938331472397950 * b06_norm
		- 3.342495816122680 * b07_norm
		+ 0.902277648009576 * b8a_norm
		+ 0.205363538258614 * b11_norm
		- 0.040607844721716 * b12_norm
		- 0.083196409727092 * viewZen_norm
		+ 0.260029270773809 * sunZen_norm
		+ 0.284761567218845 * relAzim_norm`, {
		b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm
	});

  return tansig(sum);
}

/**
 * Neuron 2
 * @param {ee.Image} b03_norm
 * @param {ee.Image} b04_norm
 * @param {ee.Image} b05_norm
 * @param {ee.Image} b06_norm
 * @param {ee.Image} b07_norm
 * @param {ee.Image} b8a_norm
 * @param {ee.Image} b11_norm
 * @param {ee.Image} b12_norm
 * @param {ee.Image} viewZen_norm
 * @param {ee.Image} sunZen_norm
 * @param {ee.Image} relAzim_norm
 * @returns {ee.Image}
 */
function neuron2(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm) {
	const sum = ee.Image().expression(`
		+ 1.416008443981500
		- 0.132555480856684 * b03_norm
		- 0.139574837333540 * b04_norm
		- 1.014606016898920 * b05_norm
		- 1.330890038649270 * b06_norm
		+ 0.031730624503341 * b07_norm
		- 1.433583541317050 * b8a_norm
		- 0.959637898574699 * b11_norm
		+ 1.133115706551000 * b12_norm
		+ 0.216603876541632 * viewZen_norm
		+ 0.410652303762839 * sunZen_norm
		+ 0.064760155543506 * relAzim_norm`, {
		b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm
	});

  return tansig(sum);
}

/**
 * Neuron 3
 * @param {ee.Image} b03_norm
 * @param {ee.Image} b04_norm
 * @param {ee.Image} b05_norm
 * @param {ee.Image} b06_norm
 * @param {ee.Image} b07_norm
 * @param {ee.Image} b8a_norm
 * @param {ee.Image} b11_norm
 * @param {ee.Image} b12_norm
 * @param {ee.Image} viewZen_norm
 * @param {ee.Image} sunZen_norm
 * @param {ee.Image} relAzim_norm
 * @returns {ee.Image}
 */
function neuron3(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm) {
	const sum = ee.Image().expression(`
		+ 1.075897047213310
		+ 0.086015977724868 * b03_norm
		+ 0.616648776881434 * b04_norm
		+ 0.678003876446556 * b05_norm
		+ 0.141102398644968 * b06_norm
		- 0.096682206883546 * b07_norm
		- 1.128832638862200 * b8a_norm
		+ 0.302189102741375 * b11_norm
		+ 0.434494937299725 * b12_norm
		- 0.021903699490589 * viewZen_norm
		- 0.228492476802263 * sunZen_norm
		- 0.039460537589826 * relAzim_norm`, {
		b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm
	});

  return tansig(sum);
}

/**
 * Neuron 5
 * @param {ee.Image} b03_norm
 * @param {ee.Image} b04_norm
 * @param {ee.Image} b05_norm
 * @param {ee.Image} b06_norm
 * @param {ee.Image} b07_norm
 * @param {ee.Image} b8a_norm
 * @param {ee.Image} b11_norm
 * @param {ee.Image} b12_norm
 * @param {ee.Image} viewZen_norm
 * @param {ee.Image} sunZen_norm
 * @param {ee.Image} relAzim_norm
 * @returns {ee.Image}
 */
function neuron4(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm) {
	const sum = ee.Image().expression(`
		+ 1.533988264655420
		- 0.109366593670404 * b03_norm
		- 0.071046262972729 * b04_norm
		+ 0.064582411478320 * b05_norm
		+ 2.906325236823160 * b06_norm
		- 0.673873108979163 * b07_norm
		- 3.838051868280840 * b8a_norm
		+ 1.695979344531530 * b11_norm
		+ 0.046950296081713 * b12_norm
		- 0.049709652688365 * viewZen_norm
		+ 0.021829545430994 * sunZen_norm
		+ 0.057483827104091 * relAzim_norm`, {
		b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm
	});

  return tansig(sum);
}

/**
 * Neuron 4
 * @param {ee.Image} b03_norm
 * @param {ee.Image} b04_norm
 * @param {ee.Image} b05_norm
 * @param {ee.Image} b06_norm
 * @param {ee.Image} b07_norm
 * @param {ee.Image} b8a_norm
 * @param {ee.Image} b11_norm
 * @param {ee.Image} b12_norm
 * @param {ee.Image} viewZen_norm
 * @param {ee.Image} sunZen_norm
 * @param {ee.Image} relAzim_norm
 * @returns {ee.Image}
 */
function neuron5(b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm) {
	const sum = ee.Image().expression(`
		+ 3.024115930757230
		- 0.089939416159969 * b03_norm
		+ 0.175395483106147 * b04_norm
		- 0.081847329172620 * b05_norm
		+ 2.219895367487790 * b06_norm
		+ 1.713873975136850 * b07_norm
		+ 0.713069186099534 * b8a_norm
		+ 0.138970813499201 * b11_norm
		- 0.060771761518025 * b12_norm
		+ 0.124263341255473 * viewZen_norm
		+ 0.210086140404351 * sunZen_norm
		- 0.183878138700341 * relAzim_norm`, {
		b03_norm, b04_norm, b05_norm, b06_norm, b07_norm, b8a_norm, b11_norm, b12_norm, viewZen_norm, sunZen_norm, relAzim_norm
	});
  return tansig(sum);
}

/**
 * Layer 2
 * @param {ee.Image} neuron1
 * @param {ee.Image} neuron2
 * @param {ee.Image} neuron3
 * @param {ee.Image} neuron4
 * @param {ee.Image} neuron5
 * @returns {ee.Image}
 */
function layer2(neuron1, neuron2, neuron3, neuron4, neuron5) {
  return ee.Image().expression(`
		+ 1.096963107077220
		- 1.500135489728730 * neuron1
		- 0.096283269121503 * neuron2
		- 0.194935930577094 * neuron3
		- 0.352305895755591 * neuron4
		+ 0.075107415847473 * neuron5`, {
		neuron1, neuron2, neuron3, neuron4, neuron5
	});
}

/**
 * Normalize
 * @param {ee.Image} unnormalized
 * @param {Number} min
 * @param {Number} max 
 * @returns {ee.Image}
 */
function normalize(unnormalized, min, max) {
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
function denormalize(normalized, min, max) {
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
function tansig(input) {
	return input.expression('2 / (1 + E ** (-2 * input)) - 1', {
		input,
		E: Math.E
	});
}