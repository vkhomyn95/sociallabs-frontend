// Access-токен живе лише в пам'яті: XSS не дістане його з localStorage, а після
// перезавантаження сторінки auth store отримує новий через /auth/refresh (HttpOnly cookie).
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}
