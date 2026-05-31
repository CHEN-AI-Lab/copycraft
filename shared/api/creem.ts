import { createCreem } from 'creem_io'

export const creem = createCreem({
  apiKey: process.env.CREEM_API_KEY || '',
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET || '',
  testMode: true,
})