# ProjectCollab

[![Production Build Status](https://img.shields.io/github/actions/workflow/status/Pawel2923/projectcollab-app/prod-docker-build.yml?branch=main&label=Production%20Build)](https://github.com/Pawel2923/projectcollab-app/actions)

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.pl.md)

PLATFORMA DO ZARZĄDZANIA PROJEKTAMI Z INTEGRACJĄ METODOLOGII AGILE

ProjectCollab to aplikacja webowa umożliwiająca zarządzanie projektami
realizowanymi zgodnie z metodykami Agile (Scrum, Kanban) oraz komunikację zespołową. Aplikacja została
opracowana w ramach pracy inżynierskiej.

## Funkcjonalności

- **Uwierzytelnianie** przy użyciu kont Microsoft i Google, a także adresu e-mail i hasła.
- **System ABAC (Attribute-Based Access Control)** pozwalający na kontrolę dostępu do zasobów organizacji.
- **Nawigacja i wyszukiwanie** pozwalają na szybki dostęp do elementów aplikacji.
- **Organizacje i projekty** pozwalają na zarządzanie członkami zespołów i uporządkowanie pracy.
- **Czat tekstowy** pozwala na zintegrowaną komunikację zespołową i zachowanie kontekstu prac.
- **Tablica Kanban i lista zadań** pozwalają na wyświetlanie i zarządzanie zadaniami w projekcie.
- **Sprinty** pozwalają zarządzać backlogiem produktu i planować sprinty według iteracyjnego tworzenia oprogramowania.
- **Synchronizacja kalendarzy** Google i Microsoft, aby z łatwością śledzić terminy zadań.
- **Raporty** pozwalają na sprawdzanie poświęconego czasu i aktywności dla zadań.

---
## Uruchamianie aplikacji

### Wymagania wstępne

**Narzędzia**

- [Docker](https://www.docker.com/) (oraz Docker Compose v2)
- [Node.js (wersja 22 lub nowsza)](https://nodejs.org/en/download)
- [GNU Make](https://www.gnu.org/software/make/) (opcjonalnie, do wygodnego uruchamiania skrótów komend)

**Konfiguracja środowiska**

- **Development:** Skonfiguruj wymagane zmienne środowiskowe w pliku `.env` (skopiuj z `.env.example`).
- **Production:** Skonfiguruj produkcyjne zmienne środowiskowe w pliku `.env.prod.local`.

---
### Instrukcja instalacji / uruchomienia

> [!TIP]
> W repozytorium dostępny jest plik `Makefile` ułatwiający pracę z Docker Compose. Uruchom `make help`, aby wyświetlić listę wszystkich dostępnych celów.

#### Szybki start (Development)

Uruchom automatyczną inicjalizację (tworzy `.env` w razie braku, buduje i uruchamia kontenery oraz generuje klucze JWT):

```bash
make init
```

#### Development krok po kroku

1. Zbuduj i uruchom:

Za pomocą Make:
```bash
make up
```

Lub bezpośrednio za pomocą Docker Compose:
```bash
docker compose up --build --wait
```

2. <a id="dev-step-2"></a>Wygeneruj klucze dla pakietu `lexik`:

Za pomocą Make:
```bash
make jwt-keys
```

Lub bezpośrednio za pomocą Docker Compose:
```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```

3. Zatrzymaj aplikację:

Za pomocą Make:
```bash
make stop
```

Lub bezpośrednio za pomocą Docker Compose:
```bash
docker compose stop
```

#### Production

Wersja produkcyjna wykorzystuje `compose.yaml` oraz `compose.prod.yaml` i wymaga wskazania pliku zmiennych flagą `--env-file=.env.prod.local`.

1. Zbuduj obrazy:

Za pomocą Make:
```bash
make prod-build
```

Lub bezpośrednio za pomocą Docker Compose:
```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file=.env.prod.local build --no-cache
```

2. Uruchom aplikację:

Za pomocą Make:
```bash
make prod-up
```

Lub bezpośrednio za pomocą Docker Compose:
```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file=.env.prod.local up --wait --no-build
```

3. Wygeneruj klucze `lexik` dla środowiska produkcyjnego:

Za pomocą Make:
```bash
make jwt-keys-prod
```

Lub bezpośrednio za pomocą Docker Compose:
```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file=.env.prod.local exec api php bin/console lexik:jwt:generate-keypair
```

> [!NOTE]
> - Aplikacja korzysta z portów `80`, `443` oraz `5432`. Upewnij się, że te porty nie są zajęte.
> - Dane są utrwalane w wolumenie Dockera używanym przez usługę PostgreSQL.
> - Upewnij się, że klucze JWT zostały wygenerowane, aby uwierzytelnianie działało poprawnie.

#### Wczytywanie przykładowych danych do aplikacji (nie używać na środowisku produkcyjnym):

Za pomocą Make:
```bash
make db-fixtures
```

Lub bezpośrednio za pomocą Docker Compose:
```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```

---
### Podręczna lista komend Makefile

Uruchom `make help`, aby wyświetlić listę wszystkich dostępnych celów z opisami bezpośrednio w terminalu.

| Kategoria | Komenda | Opis |
|---|---|---|
| **Inicjalizacja i konfiguracja** | `make help` | Wyświetla listę wszystkich dostępnych komend z opisami |
| | `make env` | Tworzy plik `.env` na podstawie `.env.example`, jeśli nie istnieje |
| | `make init` | Pełna konfiguracja lokalna: tworzy `.env`, buduje/uruchamia kontenery i generuje klucze JWT |
| | `make jwt-keys` | Generuje parę kluczy JWT Lexik w kontenerze deweloperskim `api` |
| | `make jwt-keys-prod` | Generuje parę kluczy JWT Lexik w kontenerze produkcyjnym `api` |
| **Development** | `make up` / `make dev-up` | Buduje i uruchamia kontenery deweloperskie (`--build --wait`) |
| | `make up-d` / `make dev-up-d` | Uruchamia kontenery deweloperskie w tle bez przebudowywania (`-d`) |
| | `make build` / `make dev-build` | Buduje obrazy deweloperskie |
| | `make stop` / `make dev-stop` | Zatrzymuje kontenery deweloperskie bez ich usuwania |
| | `make start` / `make dev-start` | Wznawia zatrzymane kontenery deweloperskie |
| | `make down` / `make dev-down` | Zatrzymuje i usuwa kontenery deweloperskie oraz sieci |
| | `make restart [c=usługa]` | Restartuje wszystkie lub wybraną usługę (np. `make restart c=frontend`) |
| | `make logs [c=usługa]` | Śledzi logi wszystkich lub wybranej usługi (np. `make logs c=api`) |
| | `make ps` / `make dev-ps` | Wyświetla listę uruchomionych kontenerów deweloperskich |
| **Produkcja**<br>`(--env-file=.env.prod.local)` | `make prod-build` | Buduje obrazy produkcyjne bez cache (`--no-cache`) z użyciem `compose.prod.yaml` |
| | `make prod-up` | Uruchamia kontenery produkcyjne (`--wait --no-build`) |
| | `make prod-up-d` | Uruchamia kontenery produkcyjne w tle (`-d --wait --no-build`) |
| | `make prod-stop` | Zatrzymuje kontenery produkcyjne |
| | `make prod-down` | Zatrzymuje i usuwa kontenery produkcyjne oraz sieci |
| | `make prod-restart [c=usługa]` | Restartuje kontenery produkcyjne (użyj `c=usługa`) |
| | `make prod-logs [c=usługa]` | Śledzi logi kontenerów produkcyjnych (użyj `c=usługa`) |
| | `make prod-ps` | Wyświetla listę uruchomionych kontenerów produkcyjnych |
| | `make prod-push` | Wypycha obrazy produkcyjne do rejestru kontenerów |
| **Baza danych i migracje** | `make db-migrate` | Wykonuje oczekujące migracje Doctrine |
| | `make db-migration` | Generuje nową migrację Doctrine na podstawie zmian w encjach |
| | `make db-fixtures` | Wczytuje przykładowe dane (fixtures) do bazy danych (środowisko dev) |
| | `make db-validate` | Waliduje mapowania Doctrine oraz schemat bazy danych |
| | `make db-reset` | Usuwa, odtwarza bazę danych, wykonuje migracje i ładuje fixtures |
| **Backend**<br>*(Symfony / API Platform)* | `make api-sh` | Otwiera powłokę Bash w działającym kontenerze `api` |
| | `make api-console cmd="..."` | Wykonuje polecenie konsoli Symfony (np. `make api-console cmd="cache:clear"`) |
| | `make api-cache-clear` | Czyści pamięć podręczną Symfony |
| | `make api-cs-fix` | Formatuje kod PHP za pomocą PHP-CS-Fixer |
| | `make api-cs-check` | Sprawdza styl kodu PHP za pomocą PHP-CS-Fixer |
| | `make api-test` | Uruchamia testy backendu (PHPUnit) |
| **Frontend**<br>*(Next.js)* | `make frontend-sh` | Otwiera powłokę w działającym kontenerze `frontend` |
| | `make frontend-dev-check` | Uruchamia pełną weryfikację frontendu (sprawdzanie typów, lint fix, format, vitest) |
| | `make frontend-check-types` | Sprawdza typy TypeScript |
| | `make frontend-lint` | Uruchamia sprawdzanie ESLint |
| | `make frontend-lint-fix` | Automatycznie naprawia błędy ESLint |
| | `make frontend-format` | Formatuje kod frontendu za pomocą Prettier |
| | `make frontend-format-check` | Sprawdza formatowanie kodu z użyciem Prettier |
| | `make frontend-test` | Uruchamia testy frontendu za pomocą Vitest |
| **SPA**<br>*(Single Page Application)* | `make spa-build` | Buduje statyczną aplikację SPA w kontenerze frontendowym |
| **Jakość i testy** | `make check` | Uruchamia wszystkie kontrole jakości dla frontendu i backendu |
| | `make fix` | Automatycznie formatuje i naprawia style kodu (frontend i backend) |
| | `make test` | Uruchamia testy frontendu i backendu |
| **Konserwacja i czyszczenie** | `make clean` | Zatrzymuje i usuwa kontenery deweloperskie oraz osierocone sieci |
| | `make clean-volumes` | Zatrzymuje i usuwa kontenery, osierocone sieci oraz trwałe wolumeny |

---
## Współtworzenie

Wszelki wkład i rozwój projektu są mile widziane! Zapoznaj się z naszymi [Zasadami Współtworzenia](CONTRIBUTING.pl.md) przed przesłaniem Pull Requesta lub utworzeniem zgłoszenia.

W kwestiach związanych z bezpieczeństwem zapoznaj się z [Polityką Bezpieczeństwa](SECURITY.pl.md).
