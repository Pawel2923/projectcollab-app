# PLATFORMA DO ZARZĄDZANIA PROJEKTAMI Z INTEGRACJĄ METODOLOGII AGILE PROJECTCOLLAB

Platforma ProjectCollab stanowi aplikację webową wspomagającą zarządzanie projektami
realizowanymi zgodnie z metodykami Agile (Scrum, Kanban). Aplikacja została
opracowana jako część pracy inżynierskiej i umożliwia m.in. zarządzanie projektami,
zadaniami, sprintami oraz komunikację zespołową.

## Instrukcja uruchamiania aplikacji

### Wymagania wstępne

Przed uruchomieniem aplikacji należy upewnić się, że na komputerze zainstalowane są następujące narzędzia:

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (wersja 22 lub nowsza)

### Kroki uruchomienia aplikacji

1. Będąc w głównym katalogu projektu, uruchom w terminalu polecenie:

```bash
docker compose up --build --wait
```

3. Wszystkie serwisy powinny być uruchomione. Dostęp do aplikacji znajduje się pod adresem [http://localhost](http://localhost). Dokumentacja OpenAPI jest dostępna pod adresem [http://localhost/docs](http://localhost/docs).

### Zatrzymanie aplikacji

Aby zatrzymać aplikację, uruchomić polecenie:

```bash
docker compose down
```

### Dodatkowe informacje

- Upewnij się, że porty 80, 443 oraz 5432 nie są zajęte przez inne aplikacje.
- Dane przechowywane w bazie danych są utrwalone w wolumenie Dockera, aby je usunąć należy usunąć wolumin.
- Można dokonać wczytania przykładowych danych do bazy danych, uruchamiając polecenie w terminalu:

```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```
