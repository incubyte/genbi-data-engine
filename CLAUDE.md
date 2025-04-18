# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands
- Backend: `npm run dev` - Start development server
- Frontend: `cd frontend && npm run dev` - Start frontend dev server
- Backend tests: `npm test` - Run all tests
- Single test: `npx jest path/to/test.test.js` - Run specific test file
- Frontend tests: `cd frontend && npm test` - Run frontend tests
- Lint frontend: `cd frontend && npm run lint` - Run ESLint on frontend

## Code Style Guidelines
- Use camelCase for variables, functions, and methods
- Use PascalCase for classes and React components
- Use JSDoc comments for public functions
- Error handling: Use custom error classes (ApiError) and centralized handling
- Create specific error types (ValidationError, DatabaseError, NotFoundError)
- Always validate user inputs
- Wrap database operations in try/catch blocks
- Follow React hooks rules (frontend)
- Format: 2 space indentation, no trailing whitespace
- Imports: Group in order: built-in modules, external packages, local modules