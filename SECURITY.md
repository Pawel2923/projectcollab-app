# Security Policy

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/SECURITY.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/SECURITY.pl.md)

This document outlines the security policy for the **ProjectCollab** project and provides guidelines for reporting vulnerabilities and deployment best practices.

---

## Supported Versions

The project's support status is as follows:

| Version | Supported | Description |
| :--- | :--- | :--- |
| `main` (1.0.x) | :warning: Limited | Updates when possible. The project is not actively maintained. |
| `< 1.0.0` | :x: No | Older experimental versions. |

---

## Reporting a Vulnerability

**Reporting security vulnerabilities via public Issues on GitHub is accepted.**

If you discover a security vulnerability in ProjectCollab, you can report it in one of the following ways:
1. **Publicly:** Create a public issue in this GitHub repository.
2. **Privately (Optional):** If you prefer not to disclose the vulnerability publicly, you can send an email to `projectcollab@nis-lab.com`.

*Note: Since this project is not actively maintained, updates and security patches may be released infrequently and on a best-effort basis.*

---

## Coordinated Disclosure

While public bug reporting via GitHub Issues is accepted, we appreciate coordinated vulnerability disclosure for private reports. If you contact us by email, please give us time to respond or prepare a fix before disclosing the details publicly.

---

## Deployment Security Best Practices

When deploying ProjectCollab in a production environment, ensure that the following security guidelines are followed:

### 1. Secret Management
* **Change default values:** Never deploy the application with default credentials. Make sure the following variables in the production `.env` file have been generated using a secure random generator (e.g., `openssl rand -hex 32`):
  * `APP_SECRET`
  * `JWT_PASSPHRASE`
  * `POSTGRES_PASSWORD`
  * `CADDY_MERCURE_JWT_SECRET`
  * `AUTH_SECRET`
* **Do not publish secrets:** The `.env` and `.env.prod.local` files containing production credentials should not be added to the version control system (Git).

### 2. Network Control and CORS
* **Trusted Hosts:** Configure the `TRUSTED_HOSTS` and `CORS_ALLOW_ORIGIN` variables in the `.env` file to match only your actual domains. Do not use wildcards (`*`) or development settings in production.
* **Restrict database and cache access:** Make sure that the Postgres database port (`5432`) and Redis port (`6379`) are not publicly accessible on the Internet. Use internal Docker networks or restrict port binding to localhost.

### 3. HTTPS / TLS Configuration
* **Enforce TLS:** Always configure `SERVER_NAME` with the `https://` prefix in a production environment so that Caddy can automatically generate and enforce TLS certificates.
* **Secure Cookies:** In production, ensure that cookies used for session management (NextAuth / JWT) have security attributes enabled (`Secure`, `HttpOnly`, `SameSite=Lax` or `Strict`).

### 4. JWT Key Security
* Ensure that the private key (`config/jwt/private.pem`) generated using the `lexik:jwt:generate-keypair` command has restricted read permissions on the host system, preventing access by unauthorized users.
* Never add the private JWT key to the Git repository.
