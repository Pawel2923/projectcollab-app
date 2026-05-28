export interface SignOutRedirectResponse {
  redirect: string;
  cookies: unknown[];
}

export interface LogoutResponse {
  ok: boolean;
  redirect?: SignOutRedirectResponse;
}
