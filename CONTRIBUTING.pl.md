# Zasady Współtworzenia Projektu (ProjectCollab)

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.pl.md)

Dziękujemy za zainteresowanie udziałem w rozwoju projektu **ProjectCollab**! Zachęcamy do zgłaszania błędów, proponowania nowych funkcji, tworzenia poprawek w kodzie oraz udoskonalania dokumentacji.

Ten dokument przedstawia zasady i standardy obowiązujące przy kontrybucji do repozytorium. Prosimy o zapoznanie się z poniższymi wytycznymi przed przesłaniem kodu.

---

## Kodeks Postępowania

Oczekujemy od wszystkich współtwórców utrzymywania profesjonalnego, szacunkowego i włączającego środowiska we wszystkich interakcjach w społeczności, zgłoszeniach (Issues) oraz propozycjach zmian (Pull Requests).

---

## Kluczowe Zasady Pracy z Projektem

> [!IMPORTANT]
> **Wymóg uruchamiania poleceń w kontenerach Docker**
> 
> **NIGDY** nie uruchamiaj poleceń `pnpm`, `npm`, `composer` ani konsoli Symfony bezpośrednio na maszynie gospodarza (host).
> Wszystkie zależności i narzędzia są zarządzane wewnątrz kontenerów Docker. Wszystkie komendy wykonuj wyłącznie za pomocą Docker Compose:
>
> ```bash
> # Przykład dla frontend:
> docker compose exec frontend pnpm install
> docker compose exec frontend pnpm dev-check
>
> # Przykład dla API backendowego:
> docker compose exec api php bin/console doctrine:schema:validate
> docker compose exec api composer install
> ```

---

## Lokalne Środowisko Programistyczne

1. **Klonowanie repozytorium:**
   ```bash
   git clone https://github.com/Pawel2923/projectcollab-app.git
   cd projectcollab-app
   ```

2. **Konfiguracja Zmiennych Środowiskowych:**
   Skopiuj plik `.env.example` do `.env` i skonfiguruj wymagane parametry:
   ```bash
   cp .env.example .env
   ```

3. **Uruchomienie Kontenerów Docker:**
   ```bash
   docker compose up --build --wait
   ```

4. **Generowanie Kluczy JWT dla Uwierzytelniania:**
   ```bash
   docker compose exec api php bin/console lexik:jwt:generate-keypair
   ```

5. **(Opcjonalnie) Wczytanie Przykładowych Danych:**
   ```bash
   docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
   ```

---

## Konwencja Gałęzi i Komitów

### Nazewnictwo Gałęzi (Branches)
Twórz opisowe nazwy gałęzi, używając następujących prefiksów:
* `feat/` – Nowa funkcja (np. `feat/kanban-filter`)
* `fix/` – Naprawa błędu (np. `fix/jwt-refresh-token`)
* `docs/` – Aktualizacja dokumentacji (np. `docs/contributing-guide`)
* `refactor/` – Refaktoryzacja kodu bez zmiany funkcjonalności (np. `refactor/server-actions`)
* `test/` – Dodanie lub aktualizacja testów (np. `test/task-service`)
* `chore/` – Zadania utrzymaniowe lub aktualizacja zależności (np. `chore/bump-next`)

### Wiadomości Komitów (Commit Messages)
Stosujemy standard [Conventional Commits](https://www.conventionalcommits.org/pl/v1.0.0/). Formatuj komity według schematu:
```text
<typ>(<zakres>): <krótki opis>

[opcjonalny szczegółowy opis]
```
* **Przykłady:**
  * `feat(frontend): add filter drawer to kanban board`
  * `fix(api): correct user authorization check on sprint creation`
  * `docs: update setup instructions in README`

---

## Standardy Architektury Frontend (`/frontend`)

Aplikacja frontendowa zbudowana jest na **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, **`shadcn/ui`** oraz **Zod**.

### Zasady Architektoniczne

1. **Zarządzanie Formularzami i Stanem:**
   * **NIE używaj `react-hook-form` ani Formik.**
   * Używaj natywnych formularzy HTML `<form action={formAction}>` z połączeniu z Next.js Server Actions.
   * Zarządzaj wykonaniem Akcji Serwerowych, błędami i stanem ładowania za pomocą natywnego hooka React `useActionState`.
   * Obsługuj stan `isPending` zwracany przez `useActionState`: wyłączaj przyciski i pola formularza podczas wysyłania.

2. **Wzorzec Server Action:**
   Każda akcja serwerowa musi być zgodna z przyjętym standardem:
   * Przyjmuje `(prevState: unknown, formData: FormData)`.
   * Waliduje dane schematem Zod. W przypadku błędu walidacji zwraca:
     ```typescript
     { ok: false, code: "VALIDATION_ERROR", status: 400, errors: z.treeifyError(validated.error) }
     ```
   * Pobiera/odświeża token auth przez `getOrRefreshAccessToken(nextApiUrl)`.
   * Przy zapytaniach `PATCH` do API Platform wysyła nagłówek: `Content-Type: application/merge-patch+json`.
   * Obsługuje błędy przez `handleApiError(error, "Opis kontekstu akcji")`.

3. **Bezpieczeństwo Typów i Struktura Komponentów:**
   * Stosuj ścisły TypeScript. Unikaj `any`.
   * Używaj pól ukrytych `<input type="hidden" name="id" value={...} />` dla identyfikatorów zasobów.
   * Preferuj komponenty `shadcn/ui` (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`).

### Komendy Sprawdzania Jakości (Uruchamiane w kontenerze)

```bash
# Sprawdzanie typów TypeScript
docker compose exec frontend pnpm check-types

# Linter (ESLint)
docker compose exec frontend pnpm lint

# Automatyczna naprawa błędów lintera
docker compose exec frontend pnpm lint:fix

# Sprawdzenie formatowania Prettier
docker compose exec frontend pnpm format-check

# Automatyczne formatowanie kodu
docker compose exec frontend pnpm format

# Uruchomienie testów jednostkowych i komponentowych
docker compose exec frontend pnpm test

# Pełne sprawdzenie przed komitem (typów, lintera, formatowania i testów)
docker compose exec frontend pnpm dev-check
```

---

## Standardy Architektury Backend (`/api`)

API backendowe zbudowane jest na **Symfony 7.3**, **API Platform 4.2**, **PHP 8.4+**, **Doctrine ORM** i **FrankenPHP**.

### Zasady Architektoniczne

1. **REST & API Platform:**
   * Używaj atrybutów API Platform do definiowania punktów końcowych.
   * Zachowaj zgodność z formatami JSON-LD / Hydra.

2. **Baza Danych i Migracje:**
   * Nigdy nie modyfikuj bazy danych ręcznie. Zawsze twórz migracje Doctrine:
     ```bash
     docker compose exec api php bin/console make:migration
     docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
     ```

3. **Standardy Jakości Kodu:**
   * Przestrzegaj standardu PSR-12.
   * Zachowaj jasny podział odpowiedzialności między kontrolerami, serwisami, DTO i encjami.

### Komendy Sprawdzania Jakości (Uruchamiane w kontenerze)

```bash
# Walidacja mapowania schematu Doctrine
docker compose exec api php bin/console doctrine:schema:validate

# Formatowanie kodu z PHP-CS-Fixer
docker compose exec api vendor/bin/php-cs-fixer fix

# Sprawdzanie formatowania kodu z PHP-CS-Fixer
docker compose exec api vendor/bin/php-cs-fixer check

# Uruchomienie testów PHPUnit
docker compose exec api bin/phpunit
```

---

## Lista Kontrolna dla Pull Requestów

Przed przesłaniem Pull Requesta upewnij się, że:

- [ ] Aplikacja buduje się i uruchamia poprawnie w Dockerze (`docker compose up --build`).
- [ ] Kod frontendowy przechodzi wszystkie testy i weryfikacje: `docker compose exec frontend pnpm dev-check`.
- [ ] Schemat bazy danych jest poprawny: `docker compose exec api php bin/console doctrine:schema:validate`.
- [ ] Testy backendowe przechodzą: `docker compose exec api bin/phpunit`.
- [ ] Kod jest zgodny z zasadami z pliku [`AGENT.md`](file:///home/pawel/projectcollab-app/AGENT.md).
- [ ] Tytuł PR i wiadomości komitów są zgodne z Conventional Commits.
- [ ] Opis PR wyjaśnia rozwiązywany problem, wprowadzone zmiany oraz sposób przetestowania.

---

## Zgłaszanie Luk Bezpieczeństwa

Jeśli wykryjesz lukę bezpieczeństwa, zapoznaj się z naszą [Polityką Bezpieczeństwa](file:///home/pawel/projectcollab-app/SECURITY.pl.md). Prosimy nie zgłaszać krytycznych luk w publicznych zgłoszeniach (Issues).
