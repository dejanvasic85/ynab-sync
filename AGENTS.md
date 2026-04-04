# Sample AGENTS.md file

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Testing instructions

- Find the CI plan in the .github/workflows folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## Code Style

- Keep code DRY; extract repeated logic into named functions/constants
- Prefer small, composable functions over large inline blocks
- Prefer switch over long if/else chains when branching on a single discriminator
- Avoid magic numbers/strings; introduce well-named constants
- Use camelCase naming for constants (no SCREAMING_CASE)
- Object constants should end with Value suffix (for example: defaultConfigValue)
- Avoid unnecessary comments; add short comments only for non-obvious intent
- Keep modules/components reasonably small; split when complexity grows

### File/Module Naming

- Non-component TypeScript module file names should be camelCase (for example: `authService.ts`)
- Co-locate types with components/modules when practical

## Data, Config, and Validation

- Centralize environment variable parsing/validation through Zod-based config modules
- Keep data access logic grouped by domain; avoid scattering query logic through UI layers
- Use explicit mapping/transform steps where boundaries between external/internal shapes exist

## Dependency Management

- Check for current stable package versions before adding dependencies
- Avoid deprecated packages/APIs when alternatives exist
