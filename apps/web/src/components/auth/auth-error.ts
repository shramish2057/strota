/**
 * Map FastAPI auth error codes to user-facing German messages.
 * Falls back to a generic error message if the code is unknown.
 */
const MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-Mail-Adresse oder Passwort sind nicht korrekt.',
  account_locked:
    'Konto vorübergehend gesperrt. Bitte versuchen Sie es in 15 Minuten erneut oder setzen Sie Ihr Passwort zurück.',
  email_already_registered: 'Mit dieser E-Mail-Adresse existiert bereits ein Konto.',
  password_too_short: 'Passwort muss mindestens 12 Zeichen lang sein.',
  invalid_token: 'Der Link ist ungültig.',
  token_already_used: 'Der Link wurde bereits verwendet.',
  token_expired: 'Der Link ist abgelaufen. Bitte fordern Sie einen neuen an.',
  missing_access_token: 'Bitte erneut anmelden.',
  invalid_access_token: 'Ihre Sitzung ist abgelaufen. Bitte erneut anmelden.',
  token_reused: 'Aus Sicherheitsgründen wurde diese Sitzung beendet. Bitte erneut anmelden.',
  user_gone: 'Konto nicht mehr verfügbar.',
};

export function authErrorMessage(code?: string): string {
  if (!code) return 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.';
  return MESSAGES[code] ?? 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.';
}
