import 'node-self';

import * as ee from '@google/earthengine';
import { NextResponse } from 'next/server';
import { authenticate, evaluate } from '../../module/ee-script';

export async function POST(req: Request) {
  try {
    // Parse the point data
    const { point, imageFunction }: { point: GeoJSON.Geometry; imageFunction: JSON } =
      await req.json();

    // Authenticate
    await authenticate();

    // Geometry data
    const geometry: ee.Geometry = ee.Geometry(point);

    // Image data
    const image: ee.Image = ee.Image(ee.Deserializer.fromCloudApiJSON(imageFunction));

    // Reduce
    const reduce: ee.Dictionary = image.reduceRegion({
      scale: 10,
      maxPixels: 1e13,
      reducer: ee.Reducer.first(),
      geometry: geometry,
    });

    // Evaluated value
    const values: Record<string, number> = await evaluate(reduce);

    // Return it
    return NextResponse.json({ values }, { status: 200 });
  } catch ({ message }) {
    const errMessage: string = message;
    // Return it
    return NextResponse.json({ message: errMessage }, { status: 404 });
  }
}
