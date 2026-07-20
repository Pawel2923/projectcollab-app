## Description

Please include a summary of the changes and the related issue/motivation.

Fixes # (issue)

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code style / Refactoring (no logic change)
- [ ] Performance improvement
- [ ] Chore / Tooling update

## Architectural & Coding Compliance

- [ ] All package/cli commands were run exclusively inside Docker containers (`docker compose exec`).
- [ ] Frontend changes follow React 19 / Server Actions rules (no `react-hook-form`, native `<form>`, Zod validation).
- [ ] Strict TypeScript typing used throughout (no `any`).
- [ ] API merge-patch headers used for API Platform `PATCH` requests where applicable.

## Verification Checklist

- [ ] `docker compose exec frontend pnpm dev-check` passed successfully.
- [ ] `docker compose exec api php bin/console doctrine:schema:validate` passed successfully.
- [ ] `docker compose exec api bin/phpunit` passed successfully (if backend changes made).
- [ ] Tested locally in browser.
