import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { getPrisma } from '../../../../../prisma'

function verifyCreemSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false
  try {
    const expected = createHmac('sha256', secret).update(body).digest('hex')
    const received = signature.startsWith('sha256=') ? signature.slice(7) : signature
    // Timing-safe comparison
    const expectedBuf = Buffer.from(expected, 'utf8')
    const receivedBuf = Buffer.from(received, 'utf8')
    if (expectedBuf.length !== receivedBuf.length) return false
    return timingSafeEqual(expectedBuf, receivedBuf)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('creem-signature')
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  if (!verifyCreemSignature(body, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    // Parse webhook event
    const event = JSON.parse(body)
    const userId: string | undefined = event.data?.metadata?.userId

    if (userId) {
      const prisma = getPrisma()
      await prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: event.data?.customer?.email ?? `${userId}@placeholder.local`,
          paid: true,
        },
        update: { paid: true },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook'
    if (process.env.NODE_ENV === 'development') {
      console.error('[webhook]', message)
    }
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
