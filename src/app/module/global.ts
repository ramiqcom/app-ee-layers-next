import type { LngLatBoundsLike, Map } from 'maplibre-gl';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { createContext } from 'react';

// Types
export type Options = Array<{ value: any; label: string }>;

export type Option = { value: any; label: string };

export type VisObject = {
  bands: Array<string>;
  min: Array<number>;
  max: Array<number>;
  palette?: Array<string>;
};
export type SatelliteId = 's2' | 'landsat';

export type MethodId = 'cloudless' | 'latest' | 'composite';

export type LayerId =
  | 'true_color'
  | 'false_color'
  | 'agriculture_false_color'
  | 'enhanced_false_color'
  | 'infrared_false_color'
  | 'ndvi'
  | 'ndmi'
  | 'ndsi'
  | 'bais2'
  | 'lai'
  | 'fapar'
  | 'fcover'
  | 'cab'
  | 'ccc';

export type ImageBody = {
  geojson?: GeoJSON.GeoJSON;
  bounds?: LngLatBoundsLike;
  date: [string, string];
  satellite: SatelliteId;
  method: MethodId;
  layer: LayerId;
};

export type ImageResult = {
  tile_url: string;
  thumbnail_url: string;
  image: JSON;
  vis: VisObject;
  geometry: GeoJSON.Geometry;
};

export type MapId = {
  mapid: string;
  urlFormat: string;
  image: Object;
}

// Global context
export type GlobalContext = {
  map: Map;
  setMap: Dispatch<SetStateAction<maplibregl.Map>>;
  mapStyle: Option;
  setMapStyle: Dispatch<SetStateAction<Option>>;
  geojson: GeoJSON.GeoJSON;
  setGeojson: Dispatch<SetStateAction<GeoJSON.GeoJSON>>;
  geojsonId: string;
  setGeojsonId: Dispatch<SetStateAction<string>>;
  modalText: string;
  setModalText: Dispatch<SetStateAction<string>>;
  modalRef: MutableRefObject<any>;
  vis: VisObject;
  setVis: Dispatch<SetStateAction<VisObject>>;
  imageFunction: JSON;
  setImageFunction: Dispatch<SetStateAction<JSON>>;
  point: GeoJSON.Geometry;
  setPoint: Dispatch<SetStateAction<GeoJSON.Geometry>>;
  values: Record<string, number> | string;
  setValues: Dispatch<SetStateAction<Record<string, number> | string>>;
  geometry: GeoJSON.Geometry;
  setGeometry: Dispatch<SetStateAction<GeoJSON.Geometry>>;
};

export const Context = createContext<GlobalContext | null>(null);
