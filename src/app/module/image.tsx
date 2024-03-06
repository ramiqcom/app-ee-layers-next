import booleanIntersects from '@turf/boolean-intersects';
import { FeatureCollection, Geometry, dissolve, flatten } from '@turf/turf';
import { RasterTileSource } from 'maplibre-gl';
import { useContext, useEffect, useState } from 'react';
import visuals from '../data/visual.json';
import { Context, Option, Options } from './global';
import { Select } from './input';
import { showModal } from './utility';

/**
 * 
 * @returns Image processing panel
 */
export default function Image() {
  // States
  const {
    map,
    geojsonId,
    geojson,
    modalRef,
    setModalText,
    setVis,
    setImageFunction,
    point,
    imageFunction,
    setValues,
    geometry,
    setGeometry,
  } = useContext(Context);

  // Vector visibility
  const [vectorVisibility, setVectorVisibility] = useState(true);

  // When the visibility change hide the vector
  useEffect(() => {
    if (geojson) {
      map.setLayoutProperty(geojsonId, 'visibility', vectorVisibility ? 'visible' : 'none');
    }
  }, [vectorVisibility]);

  // Function to parse date
  const stringDate = (date: Date) => date.toISOString().split('T')[0];

  // Time object
  const miliEndDate = new Date();
  const miliStartDate = miliEndDate.getTime() - 2_592_000_000 * 3;

  // Time states
  const [endDate, setEndDate] = useState(stringDate(miliEndDate));
  const [startDate, setStartDate] = useState(stringDate(new Date(miliStartDate)));

  // Options list
  const layers = Object.keys(visuals).map(
    (value) => new Object({ label: value, value }),
  ) as Options;
  const [layer, setLayer] = useState(layers[0]);

  // Tile url
  const [tileUrl, setTileUrl] = useState<string>();

  // Tile id
  const [tileId, setTileId] = useState('tile');

  // Download link
  const [thumbnailUrl, setThumbnailUrl] = useState<string>();

  // If the tile url is defined do something
  useEffect(() => {
    if (tileUrl) {
      if (!map.getSource(tileId)) {
        map.addSource(tileId, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
        });

        map.addLayer({
          id: tileId,
          type: 'raster',
          source: tileId,
          minzoom: 0,
          maxzoom: 22,
        });
      } else {
        const source = map.getSource(tileId) as RasterTileSource;
        source.setTiles([tileUrl]);
      }
    }
  }, [tileUrl]);

  // Use effect when point change
  useEffect(() => {
    if (tileUrl) {
      window.onclick = async () => {
        try {
          // Check if the point is inside the geometry. if not failed it
          if (!booleanIntersects(point as Geometry, geometry as Geometry)) {
            throw new Error('Clicked point is not in the image');
          }

          setValues('...');

          const body = {
            point,
            imageFunction,
          };

          const res = await fetch('/api/pixel', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const { values, message } = await res.json();

          if (!res.ok) {
            throw new Error(message);
          }

          setValues(values);
        } catch (error) {
          setValues(error.message);
        }
      };
    } else {
      window.onclick = null;
    }
  }, [point, tileUrl, geometry]);

  return (
    <div className='flexible vertical float-panel gap'>
      <div className='title'>Layer generator</div>

      <div className='flexible vertical'>
        Bounds
        <div className='flexible'>
          <input
            type='checkbox'
            checked={vectorVisibility}
            onChange={(e) => setVectorVisibility(e.target.checked)}
            disabled={geojson ? false : true}
          />
          Vector layer
        </div>
      </div>

      <div className='flexible vertical'>
        Date range
        <div className='flexible wide'>
          <input
            type='date'
            value={startDate}
            disabled={geojson ? false : true}
            onChange={(e) => {
              let value = e.target.value;
              if (value >= endDate) {
                value = stringDate(new Date(new Date(endDate).getTime() - 86_400_000));
              }
              setStartDate(value);
            }}
          />
          -
          <input
            type='date'
            value={endDate}
            disabled={geojson ? false : true}
            onChange={(e) => {
              let value = e.target.value;
              if (value <= startDate) {
                value = stringDate(new Date(new Date(startDate).getTime() - 86_400_000));
              }
              setEndDate(value);
            }}
          />
        </div>
      </div>

      <div className='flexible vertical'>
        Layer type
        <Select
          options={layers}
          value={layer}
          onChange={(value: Option) => setLayer(value)}
          disabled={geojson ? false : true}
        />
      </div>

      <button
        onClick={async () => {
          try {
            // Show modal
            showModal(modalRef, true, false, setModalText, 'Processsing layer...');
            // Flatten the polygon
            const polygon = flatten(geojson as FeatureCollection);
            const dissolved = dissolve(polygon);

            const body = {
              date: [startDate, endDate],
              geojson: dissolved,
              method: 'cloudless',
              layer: layer.value,
              satellite: 's2',
            };

            // Fetch the data
            const request = await fetch('/api/layers', {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            // Load the request
            const { tile_url, thumbnail_url, vis, message, image, geometry } = await request.json();

            // If it show error then error
            if (message) {
              throw new Error(message);
            }

            // Set tile url
            setTileUrl(tile_url);

            // Set thumbnail url
            setThumbnailUrl(thumbnail_url);

            // Set vis data
            setVis(vis);

            // Set image function
            setImageFunction(image);

            // Set image bounds
            setGeometry(geometry);

            // Hide modal
            showModal(modalRef, false);
          } catch (error) {
            // Show error
            showModal(modalRef, true, true, setModalText, error.message);
          }
        }}
        disabled={geojson ? false : true}
      >
        Show layer
      </button>

      <a href={thumbnailUrl} download target='_blank'>
        <button disabled={thumbnailUrl ? false : true} style={{ width: '100%' }}>
          Download image{' '}
        </button>
      </a>
    </div>
  );
}
