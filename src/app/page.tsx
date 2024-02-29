'use client';

import { FeatureCollection, Geometry } from '@turf/turf';
import dynamic from 'next/dynamic';
import { createContext, useRef, useState } from 'react';
import basemaps from './data/basemap.json';
import Image from './module/image';
import Legend from './module/legend';
import ee from '@google/earthengine';

// Types
export type Options = Array<{ value: any; label: string }>;
export type Option = { value: any; label: string };
export type Vis = {
  bands: Array<string>;
  min: Array<number>;
  max: Array<number>;
  palette?: Array<string>;
};

export const Context = createContext<Object>({});

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
  const [map, setMap] = useState<maplibregl.Map>(undefined);

  // Map style
  const [mapStyle, setMapStyle] = useState<Option>(basemaps[0]);

  // Geojson
  const [geojson, setGeojson] = useState<FeatureCollection>(undefined);

  // Geojson id
  const [geojsonId, setGeojsonId] = useState<String>('vector');

  // Modal text
  const [modalText, setModalText] = useState<String>(undefined);

  // Modal ref
  const modalRef = useRef();

  // Visual dictionary
  const [vis, setVis] = useState<Vis>(undefined);

  // Image function
  const [imageFunction, setImageFunction] = useState<ee.Image>(undefined);

  // Coordinate
  const [point, setPoint] = useState<Geometry>(undefined);

  // Values
  const [values, setValues] = useState<Record<string, number>>(undefined);

  // Geometry
  const [geometry, setGeometry] = useState<Geometry>(undefined);

  // States dict
  const dict = {
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

/**
 * Showing modal component
 * @param modalRef
 * @param show
 * @param canClose
 * @param setText
 * @param text
 */
export function showModal(
  modalRef: React.RefObject<any>,
  show: Boolean,
  canClose: boolean = false,
  setText?: React.SetStateAction<any>,
  text?: string,
): void {
  const modal = modalRef.current;

  if (show) {
    modal.showModal();
  } else {
    modal.close();
  }

  if (canClose) {
    modal.onclick = () => modal.close();
  } else {
    modal.onclick = () => null;
  }

  if (setText) {
    setText(text);
  }
}
