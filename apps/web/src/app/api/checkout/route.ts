import { NextRequest, NextResponse } from 'next/server'
import { creem } from '../../../lib/creem'

export async function POST(_request: NextRequest) {
  try {
    const checkout = await creem.checkouts.create({
      productId: process.env.CREEM_PRODUCT_ID || '',
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://copycraft-mauve.vercel.app'}/zh-CN/success`,
    })

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}