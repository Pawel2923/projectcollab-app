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

- [Docker](https://www.docker.com/)
- [Node.js (wersja 22 lub nowsza)](https://nodejs.org/en/download)

**Konfiguracja środowiska**

Skonfiguruj wymagane zmienne środowiskowe w pliku `.env` w głównym katalogu projektu. Dokumentacja zmiennych znajduje się w pliku `.env.example`.

---
### Instrukcja instalacji / uruchomienia

#### Development

1. Zbuduj i uruchom:

```bash
docker compose up --build --wait
```

2. <a id="dev-step-2"></a>Wygeneruj klucze dla pakietu `lexik`:

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```
3. Zatrzymaj aplikację:

```bash
docker compose stop
```
#### Production

1. Zbuduj:

```bash
docker compose -f compose.yaml -f compose.prod.yaml build --no-cache
```

2. Uruchom aplikację:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --wait --no-build
```

3. Wygeneruj klucze `lexik`, tak samo jak w wersji development ([generowanie kluczy](#dev-step-2)).

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
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
