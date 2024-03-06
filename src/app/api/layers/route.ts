// Import main function to generate the url
import { NextResponse } from 'next/server';
import { ImageBody } from '../../module/global';
import { FeatureCollection, dissolve, flatten } from '@turf/turf';

export async function POST(request: Request) {
  const body: ImageBody = await request.json();
  const { geojson } = body;

  // Flatten the polygon
  const polygon = flatten(geojson as FeatureCollection);
  const dissolved = dissolve(polygon);

  // Set geojson in body
  body.geojson = dissolved;

  const request2 = await fetch(`${process.env.API}/api/layers`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return NextResponse.json(await request2.json(), { status: request2.ok ? 200 : 404 });
}
