import shp from "shpjs";
import { kml } from '@tmcw/togeojson';
import epsg from 'epsg';
import { toWgs84 } from "reproject";

/**
 * Function to parse geo file
 * @param {Blob} file 
 * @param {String} format 
 * @returns {Promise.<FeatureCollection>}
 */
export default async function geoParser(file, format){
	const parser = {
		zip: parseGeojson,
		kml: parseKml,
		kmz: parseKml,
		geojson: parseGeojson,
		json: parseGeojson
	};

	if (!(format in parser)){
		throw new Error('This format is not supported');
	}

	const geojson = await parser[format](file);
	const reproject = toWgs84(geojson, undefined, epsg);
	return reproject;
}

/**
 * Function to parse geojson
 * @param {Blob} file 
 * @returns {Promise.<FeatureCollection>}
 */
async function parseGeojson(file){
	return JSON.parse(await file.text());
}

/**
 * Function to parse kml
 * @param {Blob} file 
 * @returns {Promise.<FeatureCollection>}
 */async function parseKml(file){
	return kml(new DOMParser().parseFromString(await file.text(), 'application/xml'));
}

/**
 * Function to parse shp/zip
 * @param {Blob} file 
 * @returns {Promise.<FeatureCollection>}
 */async function parseShp(file){
	return await shp(await file.arrayBuffer());
}