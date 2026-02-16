export type Message = { title: string; description?: string };

export const messagesMap: Record<string, Message> = {
  EMAIL_REQUIRED: { title: "Adres email jest wymagany." },
  SERVER_CONFIG_ERROR: {
    title: "Błąd konfiguracji serwera. Skontaktuj się z administratorem.",
  },
  UNAUTHORIZED: {
    title: "Uwierzytelnienie nie powiodło się. Zaloguj się ponownie.",
  },
  INVALID_CREDENTIALS: {
    title: "Nieprawidłowe dane logowania.",
    description: "Sprawdź adres email i hasło, a następnie spróbuj ponownie.",
  },
  EMAIL_SEND_FAILED: {
    title: "Nie udało się wysłać emaila weryfikacyjnego. Spróbuj ponownie.",
  },
  VERIFY_EMAIL_SENT: {
    title:
      "Jeśli email jest zarejestrowany, link weryfikacyjny został wysłany.",
  },
  INVALID_VERIFY_EMAIL: {
    title:
      "Podany adres email jest nieprawidłowy. Sprawdź email i spróbuj ponownie.",
  },
  VALIDATION_ERROR: {
    title: "Formularz jest nieprawidłowy. Sprawdź pola formularza.",
  },
  CONFLICT: {
    title: "Konflikt danych.",
    description: "Podana wartość już istnieje w systemie.",
  },
  CREATE_USER_FAILED: {
    title: "Nie udało się utworzyć użytkownika. Spróbuj ponownie.",
  },
  LOGIN_FAILED: {
    title:
      "Logowanie nie powiodło się. Sprawdź dane logowania i spróbuj ponownie.",
  },
  REFRESH_TOKEN_MISSING: { title: "Brak tokenu odświeżania." },
  TOO_MANY_VERIFY_EMAIL_REQUESTS: {
    title: "Zbyt wiele żądań. Spróbuj ponownie później.",
  },
  USER_NOT_FOUND: { title: "Nie znaleziono użytkownika." },
  EMAIL_VERIFIED: { title: "Email zweryfikowany." },
  EMAIL_NOT_VERIFIED: {
    title: "Weryfikacja emaila nie powiodła się.",
    description:
      "Link weryfikacyjny może być nieprawidłowy lub wygasły. Spróbuj wysłać email weryfikacyjny ponownie.",
  },
  RESET_PASSWORD_REQUEST_FAILED: {
    title: "Nie udało się wysłać emaila resetującego hasło. Spróbuj ponownie.",
  },
  RESET_PASSWORD_SUCCESS: {
    title: "Hasło zostało pomyślnie zresetowane.",
    description: "Możesz teraz zalogować się swoim nowym hasłem.",
  },
  INVALID_OR_EXPIRED_RESET_TOKEN: {
    title:
      "Link resetowania hasła jest nieprawidłowy lub wygasł. Poproś o nowy.",
  },
  INTERNAL_SERVER_ERROR: {
    title: "Wewnętrzny błąd serwera. Spróbuj ponownie później.",
  },
  FORBIDDEN: {
    title: "Brak dostępu",
    description: "Nie masz uprawnień do wykonania tej akcji.",
  },
  NOT_FOUND: {
    title: "Nie znaleziono",
    description: "Żądany zasób nie został znaleziony.",
  },
  NETWORK_ERROR: {
    title: "Błąd połączenia",
    description:
      "Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.",
  },
  TIMEOUT_ERROR: {
    title: "Przekroczono limit czasu",
    description: "Żądanie przekroczyło limit czasu. Spróbuj ponownie.",
  },
  SERVER_ERROR: {
    title: "Błąd serwera",
    description: "Wystąpił błąd serwera. Spróbuj ponownie później.",
  },
  UNKNOWN_ERROR: {
    title: "Błąd",
    description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
  },
  // Fallback messages for specific validation cases
  DUPLICATE_EMAIL: { title: "Ten adres email jest już zarejestrowany." },
  DUPLICATE_USERNAME: { title: "Ta nazwa użytkownika jest już zajęta." },
  PASSWORD_TOO_SHORT: { title: "Hasło jest zbyt krótkie." },
  PASSWORD_TOO_WEAK: { title: "Hasło jest zbyt słabe." },
  PASSWORDS_DO_NOT_MATCH: { title: "Hasła nie są identyczne." },
  INVALID_URL: { title: "URL jest nieprawidłowy." },
  VALUE_TOO_SHORT: { title: "Wartość jest zbyt krótka." },
  VALUE_TOO_LONG: { title: "Wartość jest zbyt długa." },
  VALUE_REQUIRED: { title: "To pole jest wymagane." },
  INVALID_EMAIL: { title: "Adres email jest nieprawidłowy." },
  FILE_TOO_LARGE: {
    title: "Plik jest zbyt duży.",
    description: "Maksymalny rozmiar pliku to 10MB.",
  },
  UPDATE_ISSUE_STATUS_FAILED: {
    title: "Nie udało się zaktualizować statusu zadania.",
    description: "Spróbuj ponownie później.",
  },
};
