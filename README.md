# Quiz App

A React + Vite quiz app that compares real Japanese prefecture statistics. Players choose quiz types, game modes, and answer questions about population, area, and rice production.

## Features

- Japanese prefecture statistics quiz
- Randomized question generation
- Multiple game modes: normal, time attack, fail-fast
- Comparison options: more or less
- Built with React 19 and Vite

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Open the browser at the URL shown in the terminal.

## Build

Build the production output:

```bash
npm run build
```

## Testing

This project uses Vitest with a `jsdom` environment.

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Linting

Run ESLint for the project:

```bash
npm run lint
```

## Important files

- `src/App.jsx` — main quiz application
- `src/App.test.jsx` — test coverage for quiz logic and initial render
- `src/setupTests.js` — test setup for `@testing-library/jest-dom`
- `vite.config.js` — Vite config including test environment
- `package.json` — scripts and dependencies

## Links

- 日本の統計雑学クイズ: https://nitakuquizapp.vercel.app/
- データの参照元: https://www.e-stat.go.jp/
