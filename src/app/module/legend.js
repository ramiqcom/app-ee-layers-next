import { useContext } from 'react';
import { Context } from '../page';

export default function Legend() {
  const { vis, values } = useContext(Context);

  return (
    <div
      className='flexible vertical float-panel'
      id='legend'
      style={{ display: vis ? 'flex' : 'none' }}
    >
      <div className='flexible vertical big-gap text-center'>
        <div
          className='flexible big-gap'
          style={{ display: vis && vis.bands.length == 1 ? 'flex' : 'none' }}
        >
          <div style={{ width: '10%', textAlign: 'center' }}>
            {vis ? parseFloat(vis.min).toFixed(1) : null}
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
            {vis ? parseFloat(vis.max).toFixed(1) : null}
          </div>
        </div>

        Value: {values ? JSON.stringify(values) : null}
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
          {vis && vis.bands.length > 1 ? vis.bands[0] : null}
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
          {vis && vis.bands.length > 1 ? vis.bands[1] : null}
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
          {vis && vis.bands.length > 1 ? vis.bands[2] : null}
        </div>
      </div>
    </div>
  );
}
