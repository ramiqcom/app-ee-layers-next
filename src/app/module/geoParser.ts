import { kml } from '@tmcw/togeojson';
import type { Feature } from '@turf/turf';
import { area, bbox } from '@turf/turf';
import epsg from 'epsg';
import { toWgs84 } from 'reproject';
import shp from 'shpjs';

/**
 * Function to parse geodata to geojson
 * @param file
 * @param format
 * @returns
 */
export default async function geoParser(file: Blob, format: string): Promise<GeoJSON.GeoJSON> {
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

  let geojson: GeoJSON.GeoJSON = await parser[format](file);

  try {
    const reprojected = toWgs84(geojson, undefined, epsg);
    geojson = reprojected;
  } catch (err) {}

  const box = bbox(geojson);
  if (box[1] > 90 || box[1] < -90) {
    throw new Error('Data projection is unknown');
  }

  const areaGeojson = area(geojson as Feature);
  if (areaGeojson / 1e6 > 1_000_000) {
    throw new Error('Area is too big (> 1 million km2)');
  }

  return geojson;
}

/**
 * Parse geojson file
 * @param file
 * @returns
 */
async function parseGeojson(file: Blob): Promise<GeoJSON.GeoJSON> {
  return JSON.parse(await file.text());
}

/**
 * Function to parse KML file
 * @param file
 * @returns
 */
async function parseKml(file: Blob): Promise<GeoJSON.GeoJSON> {
  return kml(new DOMParser().parseFromString(await file.text(), 'application/xml'));
}

/**
 * Function to parse Shapefile
 * @param file
 * @returns
 */
async function parseShp(file: Blob): Promise<GeoJSON.GeoJSON> {
  return await shp(await file.arrayBuffer());
}
