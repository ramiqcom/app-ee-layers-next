'use client';

import dynamic from 'next/dynamic';
import { createContext, useRef, useState } from 'react';
import basemaps from './data/basemap.json' assert { type: 'json' };
import Image from './module/image';
import Legend from './module/legend';

export const Context = createContext();

// Import component after ssr
const MapCanvas = dynamic(() => import('./module/map'), {
  ssr: false,
  loading: () => <Loading />,
});

/**
 * Main components
 * @returns {ReactComponents}
 */
export default function Home() {
  // Map state
  const [map, setMap] = useState();

  // Map style
  const [mapStyle, setMapStyle] = useState(basemaps[0]);

  // Geojson
  const [geojson, setGeojson] = useState(undefined);

  // Geojson id
  const [geojsonId, setGeojsonId] = useState('vector');

  // Modal text
  const [modalText, setModalText] = useState(undefined);

  // Modal ref
  const modalRef = useRef();

  // Visual dictionary
  const [vis, setVis] = useState(undefined);

  // Image function
  const [imageFunction, setImageFunction] = useState(undefined);

  // Coordinate
  const [point, setPoint] = useState(undefined);

  // Values
  const [values, setValues] = useState(undefined);

  // Geometry
  const [geometry, setGeometry] = useState(undefined);

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
 * Loading div
 * @returns {ReactComponents}
 */
function Loading() {
  return (
    <div id='loading' className='flexible center1 center2'>
      Loading...
    </div>
  );
}

/**
 * Function to show modal
 * @param {ReactRef} modalRef
 * @param {Boolean} show
 * @param {StateSet} setText
 * @param {String} text
 */
export function showModal(modalRef, show, canClose = false, setText = () => null, text = null) {
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

  setText(text);
}
