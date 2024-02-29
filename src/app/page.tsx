'use client';

import type { FeatureCollection, Geometry } from '@turf/turf';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import basemaps from './data/basemap.json';
import { Context, Option, VisObject } from './module/global';
import Image from './module/image';
import Legend from './module/legend';
import type { GlobalContext } from './module/global';

/**
 * Import map component after ssr
 * @returns Map react component
 */
const MapCanvas = dynamic(() => import('./module/map'), {
  ssr: false,
  loading: () => <Loading />,
});

/**
 * Main react component to export
 * @returns Main react component
 */
export default function Home() {
  // Map state
  const [map, setMap] = useState<maplibregl.Map>();

  // Map style
  const [mapStyle, setMapStyle] = useState<Option>(basemaps[0]);

  // Geojson
  const [geojson, setGeojson] = useState<GeoJSON.GeoJSON>();

  // Geojson id
  const [geojsonId, setGeojsonId] = useState<string>('vector');

  // Modal text
  const [modalText, setModalText] = useState<string>();

  // Modal ref
  const modalRef = useRef();

  // Visual dictionary
  const [vis, setVis] = useState<VisObject>();

  // Image function
  const [imageFunction, setImageFunction] = useState<JSON>();

  // Coordinate
  const [point, setPoint] = useState<GeoJSON.Geometry>();

  // Values
  const [values, setValues] = useState<Record<string, number>>();

  // Geometry
  const [geometry, setGeometry] = useState<GeoJSON.Geometry>();

  // States dict
  const dict: GlobalContext = {
    map,
    setMap,
    mapStyle,
    setMapStyle,
    geojson,
    setGeojson,
    geojsonId,
    setGeojsonId,
    modalText,
    setModalText,
    modalRef,
    vis,
    setVis,
    imageFunction,
    setImageFunction,
    point,
    setPoint,
    values,
    setValues,
    geometry,
    setGeometry,
  };

  return (
    <>
      <Context.Provider value={dict}>
        <dialog id='modal' ref={modalRef}>
          {modalText}
        </dialog>
        <div id='float'>
          <Image />
          <Legend />
        </div>
        <MapCanvas />
      </Context.Provider>
    </>
  );
}

/**
 * Showing loading component
 * Loading component
 */
function Loading() {
  return (
    <div id='loading' className='flexible center1 center2'>
      Loading...
    </div>
  );
}
