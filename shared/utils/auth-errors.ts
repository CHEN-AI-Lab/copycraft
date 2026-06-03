/**
 * Supabase auth error message mapper
 * Maps common Supabase auth error messages to i18n translation keys.
 * Uses the `t` function from next-intl to get translated strings.
 */

// Known Supabase error messages → translation key mapping
const SUPABASE_ERROR_MAP: Record<string, string> = {
  'Email not confirmed': 'auth.emailNotConfirmed',
  'Invalid login credentials': 'auth.invalidCredentials',
  'User already registered': 'auth.userAlreadyExists',
  'Invalid email': 'auth.invalidEmail',
  'Rate limit exceeded': 'auth.rateLimit',
  'Signup disabled': 'auth.signupDisabled',
  'Email signups are disabled': 'auth.signupDisabled',
  'new row violates row-level security': 'auth.unexpectedError',
}

/**
 * Translate a Supabase auth error message to its localized version.
 * Falls back to the raw message if no mapping exists.
 *
 * @param supabaseMessage - The error.message from supabase.auth methods
 * @param t - next-intl `useTranslations('auth')` function
 * @returns Localized error string
 */
export function translateAuthError(
  supabaseMessage: string | null | undefined,
  t: (key: string) => string
): string {
  if (!supabaseMessage) return t('unexpectedError')

  // Direct match
  const translationKey = SUPABASE_ERROR_MAP[supabaseMessage]
  if (translationKey) return t(translationKey.replace('auth.', ''))

  // Partial match (for messages like "Email not confirmed" with extra context)
  for (const [raw, key] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (supabaseMessage.toLowerCase().includes(raw.toLowerCase())) {
      return t(key.replace('auth.', ''))
    }
  }

  // Unknown error — pass through raw
  return supabaseMessage
}
