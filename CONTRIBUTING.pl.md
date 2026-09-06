# Zasady Współtworzenia Projektu (ProjectCollab)

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.pl.md)

Dziękujemy za zainteresowanie udziałem w rozwoju projektu **ProjectCollab**! Zachęcamy do zgłaszania błędów, proponowania nowych funkcji, tworzenia poprawek w kodzie oraz udoskonalania dokumentacji.

Ten dokument przedstawia zasady i standardy obowiązujące przy kontrybucji do repozytorium. Prosimy o zapoznanie się z poniższymi wytycznymi przed przesłaniem kodu.

---

## Kodeks Postępowania

Oczekujemy od wszystkich współtwórców utrzymywania profesjonalnego, szacunkowego i włączającego środowiska we wszystkich interakcjach w społeczności, zgłoszeniach (Issues) oraz propozycjach zmian (Pull Requests).

---

## Wykonywanie Poleceń i Środowisko Docker

Środowisko deweloperskie jest zarządzane przy użyciu Docker Compose, co zapewnia spójność zależności w całym projekcie.

> [!NOTE]
> **Wykonywanie poleceń w kontenerach i restart usług**
> 
> - **Standardowe polecenia deweloperskie** (np. testy, lintery, walidacja schematu Doctrine) uruchamia się w działających kontenerach przy użyciu `docker compose exec`:
>   ```bash
>   # Weryfikacja frontendu:
>   docker compose exec frontend pnpm dev-check
>
>   # Weryfikacja backendu:
>   docker compose exec api php bin/console doctrine:schema:validate
>   docker compose exec api bin/phpunit
>   ```
> - **Zarządzanie zależnościami i pakietami:** Ze względu na to, że usługi deweloperskie (`pnpm dev`, serwer FrankenPHP) działają w trybie ciągłym, samo wykonanie instalacji pakietów wewnątrz działającego kontenera często nie wystarcza. W przypadku instalacji nowych pakietów lub zmiany zależności (np. `pnpm add`, `composer require`) dany kontener należy zrestartować lub przebudować, aby zmiany zostały poprawnie uwzględnione przez serwery deweloperskie:
>   ```bash
>   # Restart usługi w celu załadowania nowych zależności
>   docker compose restart frontend
>
>   # Lub przebudowa, jeśli zmieniła się konfiguracja Dockera
>   docker compose up --build -d
>   ```

---

## Lokalne Środowisko Programistyczne

### Wymagania wstępne

**Narzędzia**

- [Docker](https://www.docker.com/)
- [Node.js (wersja 22 lub nowsza)](https://nodejs.org/en/download)
- [Git](https://git-scm.com/)

**Konfiguracja środowiska**

Skonfiguruj wymagane zmienne środowiskowe w pliku `.env` w głównym katalogu projektu. Dokumentacja zmiennych znajduje się w pliku `.env.example`.

---

### Instrukcja konfiguracji

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/Pawel2923/projectcollab-app.git
   cd projectcollab-app
   ```

2. **Skopiuj plik zmiennych środowiskowych:**
   ```bash
   cp .env.example .env
   ```

3. **Zbuduj i uruchom aplikację:**
   ```bash
   docker compose up --build --wait
   ```

4. **Wygeneruj klucze JWT dla pakietu `lexik`:**
   ```bash
   docker compose exec api php bin/console lexik:jwt:generate-keypair
   ```

5. **Zatrzymaj aplikację:**
   ```bash
   docker compose stop
   ```

> [!NOTE]
> - Aplikacja korzysta z portów `80`, `443` oraz `5432`. Upewnij się, że te porty nie są zajęte.
> - Dane są utrwalane w wolumenie Dockera używanym przez usługę PostgreSQL.
> - Upewnij się, że klucze JWT zostały wygenerowane, aby uwierzytelnianie działało poprawnie.

#### Wczytywanie przykładowych danych do aplikacji (nie używać na środowisku produkcyjnym):

```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```

---

### Wsparcie dla Remote Development

ProjectCollab wspiera pracę na zdalnym serwerze z kontenerami Docker, umożliwiając tworzenie kodu, testowanie oraz debugowanie bezpośrednio z lokalnego IDE (PhpStorm, Visual Studio Code lub dowolnego IDE obsługującego SSH i Dev Containers). Wymagania wstępne opisano w pliku [README.pl.md](README.pl.md#wsparcie-dla-remote-development).

---

## Konwencja Gałęzi i Komitów

### Nazewnictwo Gałęzi (Branches)
Nazewnictwo gałęzi jest elastyczne i nie jest ściśle narzucane, jednak zalecamy stosowanie czytelnych, opisowych nazw z prefiksami tematycznymi, np.:
* `feat/` – Nowa funkcja (np. `feat/kanban-filter`)
* `fix/` – Naprawa błędu (np. `fix/jwt-refresh-token`)
* `docs/` – Aktualizacja dokumentacji (np. `docs/contributing-guide`)
* `refactor/` – Refaktoryzacja kodu bez zmiany funkcjonalności (np. `refactor/server-actions`)
* `test/` – Dodanie lub aktualizacja testów (np. `test/task-service`)
* `chore/` – Zadania utrzymaniowe lub aktualizacja zależności (np. `chore/bump-next`)

### Wiadomości Komitów (Commit Messages)
Stosowanie standardu [Conventional Commits](https://www.conventionalcommits.org/pl/v1.0.0/) jest **bezwzględnie wymagane**. Formatuj komity według schematu:
```text
<typ>[opcjonalny zakres]: <krótki opis>

[opcjonalny szczegółowy opis]
```

> [!NOTE]
> Zakres (`scope`) jest opcjonalny. Prawidłowe są zarówno komity z zakresem (np. `feat(frontend): dodanie panelu filtrów`), jak i bez (np. `feat: dodanie panelu filtrów`).

* **Przykłady:**
  * `feat: dodanie panelu filtrów do tablicy kanban`
  * `feat(frontend): dodanie panelu filtrów do tablicy kanban`
  * `fix: poprawa weryfikacji uprawnień przy tworzeniu sprintu`
  * `fix(api): poprawa weryfikacji uprawnień przy tworzeniu sprintu`
  * `docs: aktualizacja instrukcji instalacji w README`

---

## Standardy Architektury Frontend (`/frontend`)

Aplikacja frontendowa zbudowana jest na **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, **`shadcn/ui`**, **`react-hook-form`** oraz **Zod**.

### Zasady Architektoniczne

1. **Zarządzanie Formularzami i Walidacja:**
   * **Walidacja w pierwszej kolejności po stronie klienta:** Formularze powinny najpierw walidować dane wejściowe po stronie klienta (np. przy użyciu `react-hook-form` z `@hookform/resolvers/zod` i Zod) przed wywołaniem żądań do backendu. Zapewnia to natychmiastową informację zwrotną dla użytkownika i eliminuje zbędne zapytania sieciowe.
   * **Selektywne użycie Server Actions:** Nie każda zmiana w formularzu wymaga komunikacji z backendem. Zmiany stanu lokalnego oraz akcje wyłącznie interfejsowe powinny być obsługiwane bezpośrednio po stronie klienta. Używaj Server Actions tylko wtedy, gdy wymagana jest mutacja danych w backendzie lub użycie bezpiecznych tokenów/poświadczeń.
   * **Integracja z Server Actions:** W przypadku formularzy modyfikujących dane na serwerze, Server Action jest wywoływana po przejściu walidacji po stronie klienta. Server Action przeprowadza wtórną walidację i bezpiecznie przesyła żądanie do API Platform w Symfony.
   * **Informacja o Stanie i Ładowaniu:** Zapewnij przejrzyste stany ładowania podczas wysyłania. Wyłączaj pola formularza i wyświetlaj wskaźniki ładowania (np. korzystając z `isSubmitting` z `react-hook-form` lub `isPending` z `useActionState` / transitions).

2. **Wzorzec Server Action:**
   Gdy wymagana jest Server Action, musi być zgodna ze standardem projektu:
   * Przyjmuje `(_prevState: unknown, formData: FormData | { ... })` i zwraca `Promise<ActionResult<T>>`.
   * Waliduje dane schematem Zod. W przypadku błędu walidacji zwraca:
     ```typescript
     { ok: false, code: "VALIDATION_ERROR", status: 400, errors: z.treeifyError(validated.error) }
     ```
   * Pobiera/odświeża token auth przez `getOrRefreshAccessToken(nextApiUrl)`.
   * Przy zapytaniach `PATCH` do API Platform wysyła nagłówek: `Content-Type: application/merge-patch+json`.
   * Obsługuje błędy przez `handleApiError(error, "Opis kontekstu akcji")`.

3. **Bezpieczeństwo Typów i Struktura Komponentów:**
   * Stosuj ścisły TypeScript. Unikaj `any`.
   * W przypadku wymaganych identyfikatorów zasobów (np. `organizationId`), uwzględniaj je w polach formularza lub przekazywanym obiekcie danych.
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
- [ ] Kod jest zgodny z zasadami z pliku [`AGENTS.md`](AGENTS.md).
- [ ] Tytuł PR i wiadomości komitów są zgodne z Conventional Commits.
- [ ] Opis PR wyjaśnia rozwiązywany problem, wprowadzone zmiany oraz sposób przetestowania.

---

## Zgłaszanie Luk Bezpieczeństwa

W kwestiach związanych z bezpieczeństwem lub w przypadku wykrycia luki bezpieczeństwa zapoznaj się z naszą [Polityką Bezpieczeństwa](SECURITY.pl.md).
