# Contributing to HRMS Enterprise

Welcome to the HRMS development team! This document outlines the process for contributing to our enterprise application.

## 1. Getting Started
1. Clone the repository.
2. Run `npm install` in both `/frontend` and `/backend`.
3. Copy `.env.example` to `.env` and `.env.local` and populate the keys.
4. Run `npm run db:generate` and `npm run db:push` in the backend.

## 2. Branching Strategy
We follow a strict Trunk-Based Development model with short-lived feature branches.
- **Main branch**: `main` (Always deployable)
- **Feature branches**: `feature/JIRA-123-short-description`
- **Bug fixes**: `bugfix/JIRA-124-short-description`
- **Hotfixes**: `hotfix/JIRA-125-short-description`

## 3. Commit Message Guidelines
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add employee onboarding workflow`
- `fix: resolve JWT expiration loop`
- `docs: update API swagger spec`
- `refactor: move auth logic to service layer`

## 4. Code Style & Linting
- All code must pass `npm run lint`.
- We enforce strict TypeScript (no implicit anys).
- Use Prettier for formatting. Ensure your IDE is configured to format on save.

## 5. Pull Request Process
1. Create a Draft PR when you start working.
2. Ensure all unit and integration tests pass.
3. Mark PR as Ready for Review.
4. Obtain at least ONE approval from a Senior Engineer / Code Owner.
5. Squash and Merge into `main`.

## 6. Reporting Bugs
Use the standard JIRA template. Always include:
- Environment (Local, Staging, Prod)
- Reproduction steps
- Expected vs Actual behavior
- Relevant logs or screenshots
