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

**Narzędzia**

- [Docker](https://www.docker.com/)
- [Node.js (wersja 22 lub nowsza)](https://nodejs.org/en/download)

**Zmienne środowiskowe**

Należy odpowiednio skonfigurować zmienne środowiskowe dla aplikacji, aby mogła prawidłowo działać.
Szczegółowe nazwy zmiennych znajdziesz w plikach `.env` w głównym katalogu, a także `api` i `frontend`.

### Instrukcja uruchomienia aplikacji

1. Budowa i uruchamianie wersji dev:

```bash
docker compose up --build --wait
```

2. Wygeneruj klucz dla lexik:

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```

3. Wszystkie serwisy powinny być uruchomione. 

- Dostęp do aplikacji znajduje się pod adresem [http://localhost](http://localhost). 
- Dokumentacja OpenAPI jest dostępna pod adresem [http://localhost/docs](http://localhost/docs).

4. Zatrzymywanie aplikacji

```bash
docker compose stop
```

Dla wersji produkcyjnej i staging należy skonfigurować pod te środowiska odpowiednie zmienne. Uruchamianie prod i staging odpowiednio:

```bash
docker compose -f compose.yml -f compose.prod.yml up --wait
docker compose -f compose.yml -f compose.staging.yml up --wait
```

Dodatkowe informacje

- Upewnij się, że porty `80`, `443` oraz `5432` nie są zajęte przez inne aplikacje.
- Dane przechowywane w bazie danych są utrwalone w wolumenie Dockera.
- Szyfrowane hasła zależne są od wygenerowanych kluczy, ponowne budowanie obrazów, może uniemożliwić na ponowne logowanie. W logach serwisu `api` będzie wtedy widoczny wyjątek z LexikJWTAuthenticationBundle. Należy użyć nowych kluczy do szyfrowania haseł użytkowników.
- Wczytywanie przykładowych danych do aplikacji:

```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```
