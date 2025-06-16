# TelePets Bot

A pet raising and taming RPG game served through a Telegram Bot, built with Bun, TypeScript, Grammy.js, and PostgreSQL.

## Overview

TelePets is a Telegram bot that allows users to raise virtual pets in a fun RPG-style environment. Users can register, select starter pets, and manage their companions through interactive commands.

## Features

- **User Registration**: Simple registration flow with inline keyboards
- **Starter Pet Selection**: Choose from different pet types (Cat, Dog, Bird) with unique stats
- **Pet Management**: Check your pet's status, level, experience, and stats
- **Private Chat Only**: Bot only responds to private messages for security
- **Error Boundaries**: Built-in error handling for a stable user experience

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Bot Framework**: Grammy.js (without sessions)
- **Database**: PostgreSQL v17 with Kysely query builder
- **Containerization**: Docker Compose

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed on your machine
- [Docker](https://www.docker.com/) for database and deployment
- A Telegram Bot Token from [@BotFather](https://t.me/botfather)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
bun install
```

3. Create environment file:
```bash
cp .env.example .env
# Edit .env and add your BOT_TOKEN
```

4. Start the database:
```bash
docker-compose up postgres -d
```

5. Run the bot:
```bash
bun start
```

### Development

```bash
# Run with watch mode
bun dev

# Run with Docker Compose (full stack)
docker-compose up -d
```

### Commands

The bot supports the following commands:

- `/mypet` - Check your pet's status
- `/help` - Show available commands

Registration and pet selection are handled automatically through conversation flows.

### Code Quality

Always run these commands before completing tasks:

```bash
# Run linting
bun lint

# Fix linting issues
bun lint:fix

# Run type checking
bun typecheck

# Run tests
bun test
```

### Project Structure

```
src/
├── bot/
│   ├── bot.ts           # Bot configuration and setup
│   ├── middleware.ts    # User registration middleware
│   ├── conversations.ts # Conversation flows
│   └── pets.ts         # Pet selection and management
├── database/
│   ├── types.ts        # Database schema types
│   ├── connection.ts   # Database connection setup
│   └── migrations.ts   # Database migrations
└── index.ts            # Main application entry point
```

### Database Schema

- **users**: User registration and profile data
- **pet_types**: Available pet types with base stats
- **pets**: User's pets with individual stats and progress

### Architecture Notes

- **No Sessions**: This project specifically avoids using Grammy sessions
- **Error Boundaries**: Uses Grammy's built-in `.errorBoundary()` method
- **Private Chat Filter**: Uses Grammy's built-in `.chatType("private")` method
- **Type Safety**: Full TypeScript support with Kysely for database operations

## Contributing

1. Ensure all code quality checks pass
2. Follow the existing code style and patterns
3. Add appropriate tests for new features
4. Update documentation as needed

## License

This project is licensed under the MIT License.