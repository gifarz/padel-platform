import { NextResponse } from 'next/server'
import { getLocations } from '@/server/queries'

export async function GET() {
  const locations = await getLocations()
  return NextResponse.json(locations.map((l) => ({ id: l.id, name: l.name, city: l.city })))
}
