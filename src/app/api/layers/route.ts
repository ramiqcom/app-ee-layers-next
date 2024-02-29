// Import main function to generate the url
import generateLayer from '../../module/ee-script';
import { NextResponse } from 'next/server';
import type { ImageBody } from '../../module/global';

export async function POST(request: Request) {
  const body: ImageBody = await request.json();
  const { result, ok } = await generateLayer(body);
  return NextResponse.json(result, { status: ok ? 200 : 404 });
}
