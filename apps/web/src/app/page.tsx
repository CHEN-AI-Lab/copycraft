import { redirect } from 'next/navigation'
import { defaultLocale } from 'shared'

export default function RootPage() {
  redirect(`/${defaultLocale}`)
}