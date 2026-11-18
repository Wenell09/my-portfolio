import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: '',
  email: '',
  name: '',
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'complex_password_at_least_32_characters_long_cookie_secret_key',
  cookieName: 'portfolio_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
