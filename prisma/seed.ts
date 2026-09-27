/**
 * Seeds enough data to click through the whole app: levels, all 42 Kabupaten
 * Garut kecamatan, one venue with courts, a super admin, and a handful of
 * athletes with rating history.
 * Run with `npm run seed` after `prisma migrate dev`.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_LEVELS } from '../src/lib/rating/levels'

const db = new PrismaClient()

// Official 42 kecamatan of Kabupaten Garut (UU No. 110 Tahun 2024).
const GARUT_DISTRICTS = [
  'Garut Kota', 'Karangpawitan', 'Wanaraja', 'Tarogong Kaler', 'Tarogong Kidul',
  'Banyuresmi', 'Samarang', 'Pasirwangi', 'Leles', 'Kadungora',
  'Leuwigoong', 'Cibatu', 'Kersamanah', 'Malangbong', 'Sukawening',
  'Karangtengah', 'Bayongbong', 'Cigedug', 'Cilawu', 'Cisurupan',
  'Sukaresmi', 'Cikajang', 'Banjarwangi', 'Singajaya', 'Cihurip',
  'Peundeuy', 'Pameungpeuk', 'Cisompet', 'Cibalong', 'Cikelet',
  'Bungbulang', 'Mekarmukti', 'Pakenjeng', 'Pamulihan', 'Cisewu',
  'Caringin', 'Talegong', 'Pangatikan', 'Sucinaraja', 'Selaawi',
  'Limbangan', 'Cibiuk',
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function main() {
  for (const level of DEFAULT_LEVELS) {
    await db.level.upsert({ where: { slug: level.slug }, update: level, create: level })
  }

  const districts: Record<string, string> = {}
  for (const name of GARUT_DISTRICTS) {
    const slug = slugify(name)
    const d = await db.district.upsert({
      where: { code: slug },
      update: { name },
      create: { code: slug, slug, name },
    })
    districts[name] = d.id
  }

  const location = await db.location.upsert({
    where: { id: 'loc-gor-garut' },
    update: {},
    create: { id: 'loc-gor-garut', name: 'GOR Garut', city: 'Garut', province: 'Jawa Barat' },
  })

  await db.court.createMany({
    data: [
      { id: 'court-1', name: 'Lapangan 1', locationId: location.id },
      { id: 'court-2', name: 'Lapangan 2', locationId: location.id },
    ],
    skipDuplicates: true,
  })

  const adminPassword = await bcrypt.hash('admin12345', 10)
  await db.user.upsert({
    where: { phone: '+6281111111111' },
    update: {},
    create: {
      phone: '+6281111111111',
      name: 'Admin PBPI Garut',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  const athletes = [
    { username: 'gifar', name: 'Gifar Zaini', phone: '+6281200000001', district: 'Garut Kota', rating: 1742, gender: 'MALE' as const },
    { username: 'andre', name: 'Andre Wijaya', phone: '+6281200000002', district: 'Garut Kota', rating: 2840, gender: 'MALE' as const },
    { username: 'arif', name: 'Arif Nugraha', phone: '+6281200000003', district: 'Tarogong Kidul', rating: 1720, gender: 'MALE' as const },
    { username: 'salsa', name: 'Salsa Amelia', phone: '+6281200000004', district: 'Tarogong Kaler', rating: 1815, gender: 'FEMALE' as const },
  ]

  const athletePassword = await bcrypt.hash('atlet12345', 10)
  for (const a of athletes) {
    const user = await db.user.upsert({
      where: { phone: a.phone },
      update: {},
      create: { phone: a.phone, name: a.name, passwordHash: athletePassword, role: 'ATHLETE' },
    })
    await db.athleteProfile.upsert({
      where: { userId: user.id },
      update: { rating: a.rating },
      create: { userId: user.id, username: a.username, districtId: districts[a.district], gender: a.gender, rating: a.rating },
    })
  }

  console.log(`Seed selesai. ${GARUT_DISTRICTS.length} kecamatan dimuat.`)
  console.log('Login admin: +6281111111111 / admin12345')
  console.log('Login atlet contoh: +6281200000001 / atlet12345')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
