# GitHub Copilot Instructions for This Project

## Additional Documentation
- Use `.github/copilot-task-plans.md` for keeping track of high-level plans and low-level tasks to be implemented
- Use `.github/copilot-notes.md` to track learnings and guidance for future runs

## Project Overview
- This is a Bun project.
- This project is dockerized.

## Development Workflow
- Always run `bun install` before running lint, typecheck, or test
- Lint, typecheck, and test should pass before completing the task

## Database Configurations

### PostgreSQL
If PostgreSQL is used in this project:
- Docker Compose should use PostgreSQL v17 image
- Install and use the following packages:
  - `npm:kysely` for query building
  - `npm:pg` for PostgreSQL client

### Redis
If Redis is used in this project:
- Docker Compose should use Redis v8 image
- Install and use the following packages:
  - `npm:bullmq` for queue management
  - `npm:ioredis` for Redis client

## Telegram Bot Implementation
If this project implements a Telegram bot:
- Use `npm:grammy` and its related plugins
- **Important**: Grammy sessions MUST NOT be used in this project.