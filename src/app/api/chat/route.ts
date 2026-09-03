import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface ChatAttachment {
  name: string
  size: string
  type: 'image' | 'file'
  dataUrl?: string
  fileUrl?: string
}

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
  attachment?: ChatAttachment
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

  try {
    const where: Record<string, unknown> = {}
    if (proyekId) where.proyekId = proyekId

    const dbChats = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 300
    })

    const formattedDbChats: ApiChatMessage[] = dbChats.map((c) => ({
      id: c.id,
      proyekId: c.proyekId,
      judulProyek: c.judulProyek || undefined,
      senderId: c.senderId,
      senderName: c.senderName,
      senderRole: c.senderRole as 'pelajar' | 'umkm' | 'sekolah',
      recipientId: c.recipientId,
      recipientName: c.recipientName || undefined,
      namaUsaha: c.namaUsaha || undefined,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
      attachment: (c.attachment as unknown as ChatAttachment) || undefined
    }))

    const memoryChats = global.__global_mitra_muda_chat__ || []
    let merged = [
      ...formattedDbChats,
      ...memoryChats.filter((m) => !formattedDbChats.some((d) => d.id === m.id))
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    if (proyekId) {
      merged = merged.filter((c) => c.proyekId === proyekId)
    }

    if (recipientId || senderId) {
      merged = merged.filter(
        (c) =>
          (recipientId && (c.recipientId === recipientId || c.recipientId === 'umkm-default')) ||
          (senderId && c.senderId === senderId)
      )
    }

    return NextResponse.json({ data: merged })
  } catch {
    const allChats = global.__global_mitra_muda_chat__ || []
    let filtered = allChats
    if (proyekId) filtered = filtered.filter((c) => c.proyekId === proyekId)
    return NextResponse.json({ data: filtered })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!global.__global_mitra_muda_chat__) {
      global.__global_mitra_muda_chat__ = []
    }

    if (body.type === 'SYNC') {
      const clientChats: ApiChatMessage[] = Array.isArray(body.chats) ? body.chats : []
      for (const clientMsg of clientChats) {
        if (!clientMsg || !clientMsg.id) continue
        const existingIdx = global.__global_mitra_muda_chat__.findIndex((m) => m.id === clientMsg.id)
        if (existingIdx >= 0) {
          if (!global.__global_mitra_muda_chat__[existingIdx].attachment && clientMsg.attachment) {
            global.__global_mitra_muda_chat__[existingIdx] = clientMsg
          }
        } else {
          global.__global_mitra_muda_chat__.push(clientMsg)
        }

        try {
          await prisma.chatMessage.upsert({
            where: { id: clientMsg.id },
            update: {
              text: clientMsg.text,
              attachment: (clientMsg.attachment as unknown as object) || undefined
            },
            create: {
              id: clientMsg.id,
              proyekId: clientMsg.proyekId,
              judulProyek: clientMsg.judulProyek || null,
              senderId: clientMsg.senderId,
              senderName: clientMsg.senderName,
              senderRole: clientMsg.senderRole,
              recipientId: clientMsg.recipientId,
              recipientName: clientMsg.recipientName || null,
              namaUsaha: clientMsg.namaUsaha || null,
              text: clientMsg.text,
              attachment: (clientMsg.attachment as unknown as object) || undefined,
              createdAt: clientMsg.createdAt ? new Date(clientMsg.createdAt) : new Date()
            }
          })
        } catch {
        }
      }

      let allData: ApiChatMessage[] = global.__global_mitra_muda_chat__
      try {
        const dbChats = await prisma.chatMessage.findMany({
          orderBy: { createdAt: 'asc' },
          take: 300
        })
        const formattedDbChats: ApiChatMessage[] = dbChats.map((c) => ({
          id: c.id,
          proyekId: c.proyekId,
          judulProyek: c.judulProyek || undefined,
          senderId: c.senderId,
          senderName: c.senderName,
          senderRole: c.senderRole as 'pelajar' | 'umkm' | 'sekolah',
          recipientId: c.recipientId,
          recipientName: c.recipientName || undefined,
          namaUsaha: c.namaUsaha || undefined,
          text: c.text,
          createdAt: c.createdAt.toISOString(),
          attachment: (c.attachment as unknown as ChatAttachment) || undefined
        }))

        allData = [
          ...formattedDbChats,
          ...global.__global_mitra_muda_chat__.filter((m) => !formattedDbChats.some((d) => d.id === m.id))
        ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      } catch {
      }

      return NextResponse.json({ success: true, data: allData })
    }

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
      createdAt,
      attachment
    } = body

    if ((!text && !attachment) || !proyekId) {
      return NextResponse.json({ error: 'Data chat tidak lengkap' }, { status: 400 })
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
      text: (text || '').trim(),
      createdAt: createdAt || new Date().toISOString(),
      isRead: false,
      attachment: attachment || undefined
    }

    const existingIndex = global.__global_mitra_muda_chat__.findIndex((m) => m.id === newMsg.id)
    if (existingIndex >= 0) {
      global.__global_mitra_muda_chat__[existingIndex] = newMsg
    } else {
      global.__global_mitra_muda_chat__.push(newMsg)
    }

    try {
      await prisma.chatMessage.upsert({
        where: { id: newMsg.id },
        update: {
          text: newMsg.text,
          attachment: (newMsg.attachment as unknown as object) || undefined
        },
        create: {
          id: newMsg.id,
          proyekId: newMsg.proyekId,
          judulProyek: newMsg.judulProyek || null,
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          senderRole: newMsg.senderRole,
          recipientId: newMsg.recipientId,
          recipientName: newMsg.recipientName || null,
          namaUsaha: newMsg.namaUsaha || null,
          text: newMsg.text,
          attachment: (newMsg.attachment as unknown as object) || undefined,
          createdAt: new Date(newMsg.createdAt)
        }
      })
    } catch {
    }

    return NextResponse.json({ success: true, data: newMsg }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal mengirim chat' }, { status: 500 })
  }
}

