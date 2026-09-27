import { NextResponse } from 'next/server'
import { getDistricts } from '@/server/queries'

export async function GET() {
  const districts = await getDistricts()
  return NextResponse.json(districts.map((d) => ({ id: d.id, code: d.code, name: d.name, slug: d.slug })))
}
