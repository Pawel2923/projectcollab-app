# ProjectCollab
[![Status build status](https://img.shields.io/github/actions/workflow/status/Pawel2923/projectcollab-app/prod-docker-build.yml?branch=main&label=Production%20Build)](https://github.com/Pawel2923/projectcollab-app/actions)

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.pl.md)

PLATFORMA DO ZARZĄDZANIA PROJEKTAMI Z INTEGRACJĄ METODOLOGII AGILE PROJECTCOLLAB

ProjectCollab to aplikacja webowa umożliwiająca zarządzanie projektami
realowanymi zgodnie z metodykami Agile (Scrum, Kanban) oraz komunikację zespołową. Aplikacja została
opracowana na pracę inżynierską.

## Funkcjonalności

- **Uwierzytelnianie** przy przy użyciu kont Microsoft i Google, a także przy użyciu adresu e-mail i hasła.
- **System RBAC** pozwalający na kontrolę do zasobów organizacji.
- **Nawigacja i wyszukiwanie** pozwalają na szybki dostęp do elementów aplikacji.
- **Organizacje i projekty** pozwalają na zarządzanie członkami zespołów i uporządkowanie pracy.
- **Czat tekstowy** pozwala na zintegrowaną komunikację zespołową i zachowanie kontekstu prac.
- **Tablica Kanban i list zadań** pozwalają na wyświetlanie i zarządzanie zadaniami w projekcie.
- **Sprinty** zarządzaj backlogiem produktu i planuj sprinty według iteracyjnego tworzenia oprogramowania.
- **Synchronizuj kalendarze** Google i Microsoft, aby z łatwością śledzić terminy zadań.
- **Raporty** pozwalją na sprawdzanie wykorzystanego czasu i aktywności dla zadań.

## Uruchamianie aplikacji

### Przed uruchomieniem

**Wymagane narzędzia**

- [Docker](https://www.docker.com/)
- [Node.js (wersja 22 lub nowsza)](https://nodejs.org/en/download)

**Zmienne środowiskowe**

Skonfiguruj wymagane zmienne środowiskowe w pliku `.env` w głównym katalogu projektu. Dokumentacja zmiennych znajduje się w pliku `.env.example`.

### Instrukcja uruchomienia aplikacji

#### Wersja development

1. Budowa i uruchamianie wersji:

```bash
docker compose up --build --wait
```

2. <a id="dev-step-2"></a>Wygeneruj klucz dla pakietu `lexik`:

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```
3. Zatrzymanie działania aplikacji

```bash
docker compose stop
```
#### Wersja production

> Przed budową obrazu wersji production i uruchomieniem aplikacji, upewnij się, że skonfigurowano zmienne środowiskowe dla środowiska production w pliku `.env`.

1. Budowa wersji:

```bash
docker compose -f compose.yaml -f compose.prod.yaml build --no-cache
```

2. Uruchomienie aplikacji:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --wait --no-build
```

3. Generowanie klucza dla pakietu `lexik`, tak samo jak w wersji development ([generowanie klucza](#dev-step-2)).

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```
Dodatkowe informacje

- Upewnij się, że porty `80`, `443` oraz `5432` nie są zajęte przez inne aplikacje.
- Dane przechowywane w bazie danych są utrwalone w wolumenie Dockera.
- Mogą wystąpić błędy podczas logowania, co widać w logach serwisu `api` wyjątek z pakietu LexikJWTAuthenticationBundle. Aby naprawić ten problem, wygeneruj klucze JWT.
- Wczytywanie przykładowych danych do aplikacji:

```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```

## Konfiguracja zdalnego środowiska deweloperskiego (Remote Development)

ProjectCollab wspiera pracę na zdalnym serwerze z kontenerami Docker, umożliwiając tworzenie kodu, testowanie oraz debugowanie bezpośrednio z lokalnego IDE (PhpStorm, Visual Studio Code lub dowolnego IDE obsługującego SSH i Dev Containers).

### Wymagania wstępne

- Zdalny serwer z dostępem przez SSH.
- Zainstalowany Docker i Docker Compose na zdalnym serwerze.
- Sklonowane repozytorium ProjectCollab na zdalnym serwerze.

### 1. Łączenie przez IDE

#### Opcja A: Visual Studio Code

- **Użycie Dev Containers (Zalecane)**:
  1. Zainstaluj rozszerzenie **Dev Containers** w VS Code.
  2. Otwórz VS Code i wybierz opcję **Dev Containers: Open Folder in Container...** z Palety Poleceń (`Ctrl+Shift+P` / `Cmd+Shift+P`).
  3. Wybierz główny katalog projektu (`.devcontainer/devcontainer.json`) lub podkatalogi (`.devcontainer/api` / `.devcontainer/frontend`).
  4. VS Code automatycznie przekieruje wymagane porty (`80`, `443`, `3000`, `9003`, `5432`, `1025`, `44949`) do lokalnego komputera.

- **Bezpośrednie połączenie Remote - SSH**:
  1. Zainstaluj rozszerzenie **Remote - SSH** w VS Code.
  2. Połącz się ze zdalnym hostem (`ssh user@remote-host`).
  3. Otwórz katalog projektu (`/path/to/projectcollab-app`).
  4. Upewnij się, że kontenery Docker są uruchomione: `docker compose up -d`.

#### Opcja B: PhpStorm / JetBrains IDEs

- **Użycie Dev Containers**:
  1. W JetBrains Gateway / PhpStorm wybierz **Dev Containers**.
  2. Wybierz połączenie SSH ze zdalnym serwerem i wskaż katalog repozytorium.
  3. PhpStorm zbuduje i dołączy do pliku `.devcontainer/devcontainer.json`.

- **Bezpośrednie SSH oraz Interpreter PHP w Docker Compose**:
  1. Otwórz PhpStorm i połącz się ze zdalnym serwerem przy użyciu **Remote Development** (JetBrains Gateway) lub otwórz projekt przez SSH.
  2. Przejdź do **Settings/Preferences** > **Languages & Frameworks** > **PHP**.
  3. Dodaj nowy CLI Interpreter bazujący na **Docker Compose**:
     - Pliki konfiguracyjne: `compose.yaml`, `compose.override.yaml`
     - Usługa: `api`
  4. W **Settings** > **PHP** > **Servers** dodaj serwer o nazwie `projectcollab-api`:
     - Host: `localhost`
     - Mapowanie ścieżek: zmapuj lokalny katalog `/api` z repozytorium na ścieżkę w kontenerze `/app`.

---

### 2. Testowanie z poziomu lokalnej przeglądarki

Aplikację uruchomioną na zdalnym serwerze można bezpośrednio otwierać w lokalnej przeglądarce.

#### Metoda 1: Przekierowanie portów SSH (Zalecane dla dostępu przez localhost)

Przekieruj porty `80` i `443` ze zdalnego serwera na lokalny komputer:

```bash
ssh -L 80:localhost:80 -L 443:localhost:443 developer@remote-server-ip
```

*(Lub skorzystaj z automatycznego przekierowania portów w VS Code / Dev Container)*.

Następnie otwórz przeglądarkę i przejdź pod adres:
- Frontend / Aplikacja: `http://localhost` (lub `https://localhost`)
- Interfejs Mailcatcher: `http://localhost:44949`

#### Metoda 2: Bezpośredni adres IP lub domena serwera

Jeśli wolisz uzyskiwać dostęp bezpośrednio przez adres IP lub domenę zdalnego serwera:

1. Na zdalnym serwerze edytuj plik `.env` i ustaw:
   ```env
   SERVER_NAME=http://<ADRES_IP_LUB_DOMENA_SERWERA>
   ```
2. zrestartuj kontenery:
   ```bash
   docker compose down && docker compose up -d
   ```
3. Otwórz `http://<ADRES_IP_LUB_DOMENA_SERWERA>` w przeglądarce.

---

### 3. Gorące przeładowywanie kodu (Hot Reloading / HMR)

Zmiany wprowadzone i zapisane w lokalnym IDE są automatycznie synchronizowane na zdalny serwer i wyzwalają natychmiastowe przeładowywanie:

- **Frontend (Next.js)**: Włączone jest Hot Module Replacement (HMR). Ustawienie `WATCHPACK_POLLING: "true"` gwarantuje natychmiastowe wykrywanie zmian w plikach przez zdalne montowania wolumenów.
- **Backend (Symfony / FrankenPHP)**: FrankenPHP działa w trybie `--watch` w środowisku deweloperskim, automatycznie przeładowując kod PHP po zapisaniu pliku.

---

### 4. Uruchamianie i debugowanie z poziomu IDE

#### Debugowanie PHP (Xdebug)

1. Włącz Xdebug w pliku `.env`, ustawiając:
   ```env
   XDEBUG_MODE=debug
   ```
   Lub uruchom przy włączonym Xdebug:
   ```bash
   XDEBUG_MODE=debug docker compose up -d
   ```

2. **W VS Code**:
   - Przejdź do widoku **Run and Debug** (`Ctrl+Shift+D`).
   - Wybierz **Listen for Xdebug (PHP)** i kliknij **Start Debugging** (`F5`).

3. **W PhpStorm**:
   - Kliknij ikonę **Start Listening for PHP Debug Connections** w prawym górnym rogu.

4. Wyzwól sesję debugowania przez otwarcie strony w przeglądarce z aktywnym rozszerzeniem Xdebug lub z parametrem `?XDEBUG_SESSION_START=PHPSTORM` w adresie URL.

#### Debugowanie Frontend / Node

- Połącz debugger Node.js z portem `9229` (skonfigurowanym w `.vscode/launch.json` jako `Next.js: Attach to Node Debugger`).

