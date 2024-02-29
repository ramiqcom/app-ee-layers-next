import { authenticate, evaluate } from '../../module/ee-script';
import * as ee from '@google/earthengine';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse the point data
    const { point, imageFunction } = await req.json();

    // Authenticate
    await authenticate();

    // Geometry data
    const geometry = ee.Geometry(point);

    // Image data
    const image = ee.Image(ee.Deserializer.fromCloudApiJSON(imageFunction));

    // Reduce
    const reduce = image.reduceRegion({
      scale: 10,
      maxPixels: 1e13,
      reducer: ee.Reducer.first(),
      geometry: geometry
    });


    // Evaluated value
    const values = await evaluate(reduce);

    // Return it
    return NextResponse.json({ values }, { status: 200 });
  } catch ({ message }) {
    // Return it
    return NextResponse.json({ message }, { status: 404 });
  }
}
