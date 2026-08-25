import { NextRequest, NextResponse } from 'next/server'

export interface ApiChatMessage {
  id: string
  proyekId: string
  senderId: string
  senderName: string
  senderRole: 'pelajar' | 'umkm'
  recipientId: string
  text: string
  createdAt: string
}

declare global {
  var __global_mitra_muda_chat__: ApiChatMessage[] | undefined
}

if (!global.__global_mitra_muda_chat__) {
  global.__global_mitra_muda_chat__ = []
}

export async function GET(request: NextRequest) {
  const proyekId = request.nextUrl.searchParams.get('proyekId')
  const allChats = global.__global_mitra_muda_chat__ || []

  if (proyekId) {
    const filtered = allChats.filter((c) => c.proyekId === proyekId)
    return NextResponse.json({ data: filtered })
  }

  return NextResponse.json({ data: allChats })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, proyekId, senderId, senderName, senderRole, recipientId, text, createdAt } = body

    if (!text || !proyekId) {
      return NextResponse.json({ error: 'Data chat tidak lengkap' }, { status: 400 })
    }

    if (!global.__global_mitra_muda_chat__) {
      global.__global_mitra_muda_chat__ = []
    }

    const newMsg: ApiChatMessage = {
      id: id || 'msg-' + Date.now(),
      proyekId,
      senderId: senderId || 'user-default',
      senderName: senderName || 'User',
      senderRole: senderRole || 'pelajar',
      recipientId: recipientId || 'recipient-default',
      text: text.trim(),
      createdAt: createdAt || new Date().toISOString()
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
