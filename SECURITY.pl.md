# Polityka Bezpieczeństwa

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/SECURITY.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/SECURITY.pl.md)

Ten dokument przedstawia politykę bezpieczeństwa dla projektu **ProjectCollab** oraz zawiera wytyczne dotyczące zgłaszania podatności i dobrych praktyk wdrożeniowych.

---

## Wspierane Wersje

Status wsparcia projektu przedstawia się następująco:

| Wersja | Wspierana | Opis |
| :--- | :--- | :--- |
| `main` (1.0.x) | :warning: Ograniczone | Aktualizacje w miarę możliwości. Projekt nie jest aktywnie utrzymywany. |
| `< 1.0.0` | :x: Nie | Starsze wersje eksperymentalne. |

---

## Zgłaszanie Podatności

**Zgłaszanie podatności bezpieczeństwa za pomocą publicznych zgłoszeń (Issues) na GitHubie jest akceptowane.**

W przypadku wykrycia luki bezpieczeństwa w ProjectCollab można ją zgłosić na jeden z poniższych sposobów:
1. **Publicznie:** Utwórz publiczne zgłoszenie (Issue) w tym repozytorium GitHub.
2. **Prywatnie (Opcjonalnie):** Jeśli wolisz nie ujawniać podatności publicznie, możesz wysłać e-mail na adres `projectcollab@nis-lab.com`.

*Uwaga: Ponieważ ten projekt nie jest aktywnie utrzymywany, aktualizacje i poprawki bezpieczeństwa mogą być wydawane rzadko i w miarę możliwości.*

---

## Koordynowane Ujawnianie

Chociaż publiczne zgłaszanie błędów przez GitHub Issues jest akceptowane, doceniamy koordynowane ujawnianie podatności w przypadku zgłoszeń prywatnych. Jeśli kontaktujesz się z nami drogą mailową, prosimy o danie nam czasu na odpowiedź lub przygotowanie poprawki przed publicznym ujawnieniem szczegółów.

---

## Dobre Praktyki Bezpieczeństwa Wdrożenia

Po wdrożeniu ProjectCollab w środowisku produkcyjnym należy upewnić się, że przestrzegane są następujące zasady bezpieczeństwa:

### 1. Zarządzanie Sekretami
* **Zmień wartości domyślne:** Nigdy nie wdrażaj aplikacji z domyślnymi poświadczeniami. Upewnij się, że poniższe zmienne w produkcyjnym pliku `.env` zostały wygenerowane za pomocą bezpiecznego generatora losowego (np. `openssl rand -hex 32`):
  * `APP_SECRET`
  * `JWT_PASSPHRASE`
  * `POSTGRES_PASSWORD`
  * `CADDY_MERCURE_JWT_SECRET`
  * `AUTH_SECRET`
* **Nie publikuj sekretów:** Pliki `.env` oraz `.env.prod.local` zawierające produkcyjne dane uwierzytelniające nie powinny być dodawane do systemu kontroli wersji (Git).

### 2. Kontrola Sieci i CORS
* **Zaufane hosty (Trusted Hosts):** Skonfiguruj zmienne `TRUSTED_HOSTS` i `CORS_ALLOW_ORIGIN` w pliku `.env` tak, aby pasowały wyłącznie do Twoich rzeczywistych domen. Nie używaj znaków wieloznacznych (`*`) ani ustawień deweloperskich na produkcji.
* **Ograniczenie dostępu do bazy i pamięci podatnej:** Upewnij się, że porty bazy danych Postgres (`5432`) oraz Redis (`6379`) nie są publicznie dostępne w sieci Internet. Używaj wewnętrznych sieci Dockera lub ogranicz bindowanie portów do localhosta.

### 3. Konfiguracja HTTPS / TLS
* **Wymuś TLS:** Zawsze konfiguruj `SERVER_NAME` z prefiksem `https://` w środowisku produkcyjnym, aby Caddy mógł automatycznie wygenerować i wymusić certyfikaty TLS.
* **Bezpieczne pliki cookie (Secure Cookies):** Na produkcji upewnij się, że pliki cookie używane do zarządzania sesją (NextAuth / JWT) mają włączone atrybuty bezpieczeństwa (`Secure`, `HttpOnly`, `SameSite=Lax` lub `Strict`).

### 4. Bezpieczeństwo Kluczy JWT
* Upewnij się, że klucz prywatny (`config/jwt/private.pem`) wygenerowany za pomocą polecenia `lexik:jwt:generate-keypair` ma ograniczone uprawnienia odczytu w systemie hosta, uniemożliwiające dostęp niepowołanym użytkownikom.
* Nigdy nie dodawaj klucza prywatnego JWT do repozytorium Git.
