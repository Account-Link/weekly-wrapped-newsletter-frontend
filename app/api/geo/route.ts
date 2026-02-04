import { geolocation } from '@vercel/functions';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const geo = geolocation(request);
    
    const country = geo.country || null;
    const city = geo.city || null;
    const region = geo.region || null;
    const latitude = geo.latitude || null;
    const longitude = geo.longitude || null;

    // Helper field for frontend to easily check if user is in the US
    const isUS = country === 'US';

    return NextResponse.json({
      country,
      city,
      region,
      latitude,
      longitude,
      isUS,
    });
  } catch (error) {
    console.warn('Geo information not available:', error);
    // Fail open: assume US for development
    return NextResponse.json({
      country: null,
      city: null,
      region: null,
      latitude: null,
      longitude: null,
      isUS: true, 
    });
  }
}
