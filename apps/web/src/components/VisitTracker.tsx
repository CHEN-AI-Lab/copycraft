'use client'

import { useVisitTracking } from 'shared/hooks/useVisitTracking'

export default function VisitTracker() {
  useVisitTracking('copycraft')
  return null
}
