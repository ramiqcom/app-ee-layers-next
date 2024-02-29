// Import main function to generate the url
import generateLayer from '../../module/ee-script';
import { NextResponse } from 'next/server';

/**
 * Router handler for layer router
 * @param {Request} request
 */
export async function POST(request) {
  const body = await request.json();
  const { result, ok } = await generateLayer(body);
  return NextResponse.json(result, { status: ok ? 200 : 404 });
}
