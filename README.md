# Dynamic Question Paper Generator API

A backend API built with Node.js, Express and SQLite that generates question papers
based on total marks, selected topics and difficulty distribution.

## Features
- User registration & login (JWT + bcrypt)
- Question bank with metadata: topic, difficulty, marks
- Generate question papers: POST /api/papers/generate
- SQLite DB auto-created in backend folder

## Quick start
1. cd backend
2. npm install
3. npm run dev

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/questions (Auth required)
- POST /api/papers/generate (Auth required)

## Notes
- Do not commit `.env` or the SQLite DB file
