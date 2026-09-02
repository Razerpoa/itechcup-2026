import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getConnectionString(): string {
  let url = process.env.DATABASE_URL || ''
  if (!url) {
    try {
      const fs = require('fs')
      const path = require('path')
      const envPath = path.resolve(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const text = fs.readFileSync(envPath, 'utf8')
        const line = text.split('\n').find((l: string) => l.startsWith('DATABASE_URL='))
        if (line) url = line.split('=')[1].trim()
      }
    } catch {}
  }
  if (!url) {
    url = 'postgresql://postgres.tqjgcmjgyndtkwejtuqp:Raffarizqi2010@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
  }

  url = url.replace(/["'\r\n\s]/g, '').trim()

  
  if (url.includes('pooler.supabase.com:5432')) {
    url = url.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543')
    if (!url.includes('pgbouncer=true')) {
      url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true'
    }
  }

  return url
}

function createPrismaClient() {
  const connectionString = getConnectionString()
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 6000
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
