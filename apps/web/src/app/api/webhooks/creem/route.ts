import { NextRequest, NextResponse } from 'next/server'
import { creem } from '../../../../lib/creem'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('creem-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  try {
    await creem.webhooks.handleEvents(body, signature, {
      onCheckoutCompleted: async (data) => {
        console.log('✅ Payment received from:', data.customer?.email)
      },
    })
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid webhook' },
      { status: 400 }
    )
  }
}