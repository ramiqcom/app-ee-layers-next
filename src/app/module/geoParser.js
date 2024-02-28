import { kml } from '@tmcw/togeojson';
import epsg from 'epsg';
import { toWgs84 } from 'reproject';
import shp from 'shpjs';
import { area, bbox } from '@turf/turf';

/**
 * Function to parse geo file
 * @param {Blob} file
 * @param {String} format
 * @returns {Promise.<FeatureCollection>}
 */
export default async function geoParser(file, format) {
  format = format.toLowerCase();

  const parser = {
    zip: parseShp,
    kml: parseKml,
    kmz: parseKml,
    geojson: parseGeojson,
    json: parseGeojson,
  };

  if (!(format in parser)) {
    throw new Error('This format is not supported');
  }

  const geojson = await parser[format](file);

  const box = bbox(geojson);
  if (box[1] > 90 || box[1] < -90) {
    throw new Error('Data projection is unknown');
  }

  const areaGeojson = area(geojson);
  if (areaGeojson / 1e6 > 1_000_000) {
    throw new Error('Area is too big (> 1 million km2)');
  }

  return geojson;
}

/**
 * Function to parse geojson
 * @param {Blob} file
 * @returns {Promise.<FeatureCollection>}
 */
async function parseGeojson(file) {
  return toWgs84(JSON.parse(await file.text()), undefined, epsg);
}

/**
 * Function to parse kml
 * @param {Blob} file
 * @returns {Promise.<FeatureCollection>}
 */
async function parseKml(file) {
  return kml(new DOMParser().parseFromString(await file.text(), 'application/xml'));
}

/**
 * Function to parse shp/zip
 * @param {Blob} file
 * @returns {Promise.<FeatureCollection>}
 */
async function parseShp(file) {
  return await shp(await file.arrayBuffer());
}
