import { NextRequest, NextResponse } from 'next/server'

export interface ApiChatMessage {
  id: string
  proyekId: string
  judulProyek?: string
  senderId: string
  senderName: string
  senderRole: 'pelajar' | 'umkm' | 'sekolah'
  recipientId: string
  recipientName?: string
  namaUsaha?: string
  text: string
  createdAt: string
  isRead?: boolean
}

declare global {
  var __global_mitra_muda_chat__: ApiChatMessage[] | undefined
}

if (!global.__global_mitra_muda_chat__) {
  global.__global_mitra_muda_chat__ = []
}

export async function GET(request: NextRequest) {
  const proyekId = request.nextUrl.searchParams.get('proyekId')
  const recipientId = request.nextUrl.searchParams.get('recipientId')
  const senderId = request.nextUrl.searchParams.get('senderId')
  const allChats = global.__global_mitra_muda_chat__ || []

  let filtered = allChats

  if (proyekId) {
    filtered = filtered.filter((c) => c.proyekId === proyekId)
  }

  if (recipientId || senderId) {
    filtered = filtered.filter(
      (c) =>
        (recipientId && (c.recipientId === recipientId || c.recipientId === 'umkm-default')) ||
        (senderId && c.senderId === senderId)
    )
  }

  return NextResponse.json({ data: filtered })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      proyekId,
      judulProyek,
      senderId,
      senderName,
      senderRole,
      recipientId,
      recipientName,
      namaUsaha,
      text,
      createdAt
    } = body

    if (!text || !proyekId) {
      return NextResponse.json({ error: 'Data chat tidak lengkap' }, { status: 400 })
    }

    if (!global.__global_mitra_muda_chat__) {
      global.__global_mitra_muda_chat__ = []
    }

    const newMsg: ApiChatMessage = {
      id: id || 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      proyekId,
      judulProyek: judulProyek || 'Proyek Marketplace',
      senderId: senderId || 'user-default',
      senderName: senderName || 'Pengguna',
      senderRole: senderRole || 'pelajar',
      recipientId: recipientId || 'recipient-default',
      recipientName: recipientName || '',
      namaUsaha: namaUsaha || '',
      text: text.trim(),
      createdAt: createdAt || new Date().toISOString(),
      isRead: false
    }

    const existingIndex = global.__global_mitra_muda_chat__.findIndex((m) => m.id === newMsg.id)
    if (existingIndex >= 0) {
      global.__global_mitra_muda_chat__[existingIndex] = newMsg
    } else {
      global.__global_mitra_muda_chat__.push(newMsg)
    }

    return NextResponse.json({ success: true, data: newMsg }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal mengirim chat' }, { status: 500 })
  }
}
