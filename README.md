# Task API

A RESTful Task Management API built with Node.js, TypeScript, Prisma and PostgreSQL.
The database runs inside a Docker container.

##  Getting Started

### 1. Install dependencies
```bash
npm install
```
### 2. Run PostgreSQL with Docker
```bash
docker run --name task-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=taskdb \
  -p 5432:5432 \
  -d postgres
```
### 3.Configure environment variables
Create a .env file in the root directory:
```bash
DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskdb"
```
### 4.Run Prisma migration
```bash
npx prisma migrate dev --name init
```

## This project is currently under development.
