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
### Skrócona lista komend Makefile

| Komenda | Opis |
|---|---|
| `make help` | Wyświetla listę wszystkich dostępnych komend z opisami |
| `make init` | Automatyczna konfiguracja środowiska lokalnego (`.env`, build, start, JWT) |
| `make up` / `make down` | Start kontenerów dev (`--build --wait`) / Zatrzymanie i usunięcie kontenerów |
| `make stop` / `make start` | Zatrzymanie / Wznowienie kontenerów bez ich usuwania |
| `make restart [c=usługa]` | Restart wszystkich lub wybranej usługi (np. `make restart c=frontend`) |
| `make logs [c=usługa]` | Śledzenie logów (np. `make logs c=api`) |
| `make ps` | Lista uruchomionych kontenerów deweloperskich |
| `make prod-build` | Budowanie obrazów produkcyjnych (`--no-cache`) z `.env.prod.local` |
| `make prod-up` / `prod-down` | Uruchomienie / Zatrzymanie stosu produkcyjnego z `.env.prod.local` |
| `make db-migrate` | Wykonanie oczekujących migracji Doctrine |
| `make db-fixtures` | Wczytanie przykładowych danych (fixtures) do bazy danych |
| `make db-validate` | Walidacja schematu bazy danych i mapowania Doctrine |
| `make check` | Uruchomienie wszystkich kontroli jakości dla frontendu i backendu |
| `make fix` | Automatyczne formatowanie i naprawa stylów kodu (frontend i backend) |
| `make test` | Uruchomienie testów frontendu i backendu |

---
## Wsparcie dla Remote Development

ProjectCollab wspiera pracę na zdalnym serwerze z kontenerami Docker, umożliwiając tworzenie kodu, testowanie oraz debugowanie bezpośrednio z lokalnego IDE (PhpStorm, Visual Studio Code lub dowolnego IDE obsługującego SSH i Dev Containers).

### Wymagania wstępne

- Zdalny serwer z dostępem przez SSH.
- Zainstalowany Docker i Docker Compose na zdalnym serwerze.
- Sklonowane repozytorium ProjectCollab na zdalnym serwerze.

---
## Współtworzenie

Wszelki wkład i rozwój projektu są mile widziane! Zapoznaj się z naszymi [Zasadami Współtworzenia](CONTRIBUTING.pl.md) przed przesłaniem Pull Requesta lub utworzeniem zgłoszenia.

W kwestiach związanych z bezpieczeństwem zapoznaj się z [Polityką Bezpieczeństwa](SECURITY.pl.md).
