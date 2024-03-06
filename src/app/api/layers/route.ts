// Import main function to generate the url
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const request2 = await fetch(`${process.env.API}/api/layers`, {
    method: 'POST',
    body: await request.text(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return NextResponse.json(await request2.json(), { status: request2.ok ? 200 : 404 });
}
