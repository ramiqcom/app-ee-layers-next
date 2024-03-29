import { useContext, useEffect, useState } from 'react';
import { Context } from './global';

export default function Legend() {
  const { vis, values } = useContext(Context);

  const [singleValue, setSingleValue] = useState<string>(null);
  const [multiValue, setMultiValue] = useState<Array<string>>([null, null, null]);

  useEffect(() => {
    if (typeof values == 'string') {
      setSingleValue(values);
      setMultiValue(multiValue.map(() => values));
    }

    if (typeof values == 'object' && Object.keys(values).length === 1) {
      setSingleValue(values[Object.keys(values)[0]].toFixed(3));
    }

    if (typeof values == 'object' && Object.keys(values).length > 1) {
      setMultiValue(vis.bands.map((val, index) => values[val].toFixed(3)));
    }
  }, [values]);

  return (
    <div
      className='flexible vertical float-panel'
      id='legend'
      style={{ display: vis ? 'flex' : 'none' }}
    >
      <div
        className='flexible vertical big-gap text-center'
        style={{ display: vis && vis.bands.length == 1 ? 'flex' : 'none' }}
      >
        <div className='flexible big-gap'>
          <div style={{ width: '10%', textAlign: 'center' }}>
            {vis ? vis.min[0].toFixed(2) : null}
          </div>

          <div
            style={{
              textAlign: 'center',
              width: '80%',
              background:
                vis && vis.bands.length == 1
                  ? `linear-gradient(90deg, ${vis.palette[0]}, ${vis.palette[1]}, ${vis.palette[2]}, ${vis.palette[3]}, ${vis.palette[4]})`
                  : null,
            }}
          />

          <div style={{ width: '10%', textAlign: 'center' }}>
            {vis ? vis.max[0].toFixed(2) : null}
          </div>
        </div>
        Value: {singleValue}
      </div>

      <div
        className='flexible vertical big-gap'
        style={{ display: vis && vis.bands.length > 1 ? 'flex' : 'none' }}
      >
        <div className='flexible small-gap'>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'red',
              border: 'thin solid white',
            }}
          ></div>
          {vis && vis.bands.length > 1 ? vis.bands[0] : null}: {multiValue[0]}
        </div>

        <div className='flexible small-gap'>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'green',
              border: 'thin solid white',
            }}
          ></div>
          {vis && vis.bands.length > 1 ? vis.bands[1] : null}: {multiValue[1]}
        </div>

        <div className='flexible small-gap'>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'blue',
              border: 'thin solid white',
            }}
          ></div>
          {vis && vis.bands.length > 1 ? vis.bands[2] : null}: {multiValue[2]}
        </div>
      </div>
    </div>
  );
}
