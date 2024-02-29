import type { Map } from 'maplibre-gl';
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';
import type { FeatureCollection, Geometry } from '@turf/turf';
import { createContext } from 'react';

// Types
export type Options = Array<{ value: any; label: string }>;
export type Option = { value: any; label: string };
export type Vis = {
  bands: Array<string>;
  min: Array<number>;
  max: Array<number>;
  palette?: Array<string>;
};

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
  vis: Vis;
  setVis: Dispatch<SetStateAction<Vis>>;
  imageFunction: JSON;
  setImageFunction: Dispatch<SetStateAction<JSON>>;
  point: GeoJSON.Geometry;
  setPoint: Dispatch<SetStateAction<GeoJSON.Geometry>>;
  values: Record<string, number>;
  setValues: Dispatch<SetStateAction<Record<string, number>>>;
  geometry: GeoJSON.Geometry;
  setGeometry: Dispatch<SetStateAction<GeoJSON.Geometry>>;
};

export const Context = createContext<GlobalContext | null>(null);
