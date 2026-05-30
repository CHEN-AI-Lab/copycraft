import { NextRequest, NextResponse } from 'next/server'
import { creem } from '../../../lib/creem'

export async function POST(_request: NextRequest) {
  try {
    const productId = process.env.CREEM_PRODUCT_ID
    const apiKey = process.env.CREEM_API_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    console.log('Checkout request:', { productId: !!productId, apiKey: !!apiKey, appUrl })

    if (!productId || !apiKey) {
      return NextResponse.json(
        { error: 'Payment not configured' },
        { status: 500 }
      )
    }

    const checkout = await creem.checkouts.create({
      productId,
      successUrl: `${appUrl || 'https://copycraft-mauve.vercel.app'}/zh-CN/success`,
    })

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}