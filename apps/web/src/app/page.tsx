import { redirect } from 'next/navigation'
import { defaultLocale } from '../../next-intl.config'

export default function RootPage() {
  redirect(`/${defaultLocale}`)
}