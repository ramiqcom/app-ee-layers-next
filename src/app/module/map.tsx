import { bbox, point as pointGeo } from '@turf/turf';
import { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect } from 'react';
import geoParser from './geoParser';
import { Context } from './global';
import { showModal } from './utility';
import type { GeoJSONSource, LngLatBoundsLike } from 'maplibre-gl';

export default function MapCanvas() {
  const {
    map,
    setMap,
    mapStyle,
    geojson,
    setGeojson,
    geojsonId,
    setModalText,
    modalRef,
    setPoint,
  } = useContext(Context);

  // When file is drop on map do something
  useEffect(() => {
    window.ondragover = (e: DragEvent): void => e.preventDefault();
    window.ondrop = async (e: DragEvent): Promise<void> => {
      e.preventDefault();
      try {
        // Show modal
        showModal(modalRef, true, false, setModalText, 'Processsing...');

        const file = e.dataTransfer.files[0];
        const name = file.name;
        const format = name.split('.').at(-1);
        const geojson = await geoParser(file, format);
        setGeojson(geojson);
      } catch (error) {
        // Show modal
        showModal(modalRef, true, true, setModalText, error.message);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    let map = new Map({
      container: 'map',
      style: mapStyle.value,
      zoom: 7,
      center: [5.5, 52.25],
    });
    setMap(map);

    map.on('mousemove', (e) => {
      const { lng, lat } = e.lngLat;
      const pointGeojson = pointGeo([lng, lat]).geometry;
      setPoint(pointGeojson);
    });

    return () => {
      // Set map to null again
      map = null;
    };
  }, []);

  // Do something when map style change
  useEffect(() => {
    if (map && mapStyle.value) {
      map.setStyle(mapStyle.value);
    }
  }, [mapStyle]);

  // When the geojson data is defined, add it to map
  useEffect(() => {
    if (geojson) {
      // If the data is never added, then add it
      if (!map.getSource(geojsonId)) {
        map.addSource(geojsonId, {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: geojsonId,
          type: 'fill',
          source: geojsonId,
          paint: {
            'fill-color': 'lightskyblue',
            'fill-opacity': 0.1,
          },
        });
      } else {
        // If had, then just change the data
        const source = map.getSource(geojsonId) as GeoJSONSource;
        source.setData(geojson);
      }

      // BBOX
      const bounds = bbox(geojson) as LngLatBoundsLike;

      // Zoom to geojson
      map.fitBounds(bounds);

      // Hide modal
      showModal(modalRef, false);
    }
  }, [geojson]);

  return <div id='map' />;
}
