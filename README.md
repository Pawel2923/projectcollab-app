# ProjectCollab

PLATFORMA DO ZARZĄDZANIA PROJEKTAMI Z INTEGRACJĄ METODOLOGII AGILE PROJECTCOLLAB

ProjectCollab to aplikacja webowa umożliwiająca zarządzanie projektami
realizowanymi zgodnie z metodykami Agile (Scrum, Kanban) oraz komunikację zespołową. Aplikacja została
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
