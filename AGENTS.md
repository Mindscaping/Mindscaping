# Agent Instructions — Mindscaping

## Mandatory TDD

Every code change follows test-driven development. No exceptions.

### The Cycle

1. **Red** — Write a failing test that describes the behavior you're about to implement. Run `npm test`. It must fail. If it passes, your test isn't testing the right thing.
2. **Green** — Write the minimum code to make the test pass. Run `npm test`. It must pass. Do not add behavior beyond what the test demands.
3. **Done** — One cycle complete. Move to the next failing test.

Refactoring belongs in a separate step after all tests pass, not during the red-green cycle.

### What Counts as a "Code Change"

- New or modified components (`.tsx`)
- New or modified hooks (`.ts`)
- New or modified lib functions (`.ts`)
- New or modified API routes (`app/api/`)
- Middleware changes
- Config changes (next.config.ts, vitest.config.ts, etc.)
- CSS/styling changes that affect behavior (animations, responsive logic)

### What Does NOT Require a Failing Test First

- Typo fixes in prose/content
- Dependency version bumps (existing tests must still pass)
- Formatting/lint-only changes

Even for exempt changes, run `npm test` before committing to verify nothing broke.

---

## Per-Type Testing Strategies

### Components

Test rendering, user interactions, and prop-driven behavior. Never test internal state or implementation details.

```tsx
// File: test/components/MyComponent.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

import MyComponent from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders expected content", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
  });
});
```

**Pattern:** Mocks at top → import after → describe/it blocks.

### Hooks

Test via `renderHook` or a wrapper component. Mock browser APIs in `beforeEach`, restore in `afterEach`.

```tsx
import { renderHook, act } from "@testing-library/react";
import { useMyHook } from "@/hooks/useMyHook";

describe("useMyHook", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(defaultValue);
  });
});
```

For hooks that use `setTimeout`/`setInterval`, use `vi.useFakeTimers()` in `beforeEach` and `vi.useRealTimers()` in `afterEach`.

### lib/*.ts Functions

Test exported functions through their public interface. Mock external dependencies (`fs`, `@prisma/client`, third-party SDKs).

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const readFileSync = vi.fn();
vi.mock("fs", () => ({
  default: { readFileSync },
}));

// Import AFTER mock
import { myFunction } from "@/lib/myModule";

describe("myFunction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns expected result", () => {
    readFileSync.mockReturnValue('{"key":"value"}');
    expect(myFunction()).toEqual({ key: "value" });
  });
});
```

### API Routes

Extract the handler, call it with a mock `Request`, assert the `Response`. Mock auth (`next/headers`), db (`@prisma/client`), and external services.

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: () => ({ value: "mock-token" }),
  }),
}));

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

import { GET } from "@/app/api/my-endpoint/route";

describe("GET /api/my-endpoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without valid session", async () => {
    const req = new Request("http://localhost/api/my-endpoint");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
```

### Config Files

For `next.config.ts`, `vitest.config.ts`, `eslint.config.mjs`, etc.:

1. Write a test that validates the config loads without error
2. Or write a snapshot test of the exported config object
3. Or verify the build succeeds (`npm run build` as the "test")

```ts
import { describe, it, expect } from "vitest";
import config from "../next.config";

describe("next.config", () => {
  it("exports valid config", () => {
    expect(config).toBeDefined();
    expect(config.headers).toBeDefined();
  });
});
```

### CSS/Styling

For behavioral CSS (animations, responsive breakpoints):

1. Snapshot test of the CSS output (if using CSS-in-JS)
2. Or test that the DOM structure includes expected class names
3. Or visual regression test (if tooling is set up)

For Tailwind utility changes: no test required, but `npm run build` must succeed.

---

## Test File Conventions

### Location

```
test/
  lib/           → lib/*.ts tests
  hooks/         → hooks/*.ts tests
  components/    → components/**/*.tsx tests
  app/           → app/**/page.tsx and route.ts tests
  accessibility/ → axe-core scans
  setup.ts       → global setup (jest-dom matchers)
```

Test file mirrors source: `lib/auth.ts` → `test/lib/auth.test.ts`, `components/layout/Nav.tsx` → `test/components/Nav.test.tsx`.

### Import Order

1. `vi.mock()` calls (must be before imports)
2. Test utilities (`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`)
3. Rendering utilities (`render`, `screen`, `fireEvent`, `waitFor`, `act`)
4. Component/function under test (imported AFTER all mocks)

### Mocking Rules

- **`next/image`**: Mock with plain `<img>` (see component pattern above)
- **`next/link`**: Mock with plain `<a>` (see component pattern above)
- **`IntersectionObserver`**: Mock as class in `beforeEach`, capture callback if needed
- **`fetch`**: `vi.stubGlobal("fetch", vi.fn().mockResolvedValue(...))`
- **`fs`**: Mock individual methods or entire module
- **`@prisma/client`**: Mock PrismaClient with class stubs
- **`next/headers`**: Mock `cookies()` and `headers()`
- **`next/navigation`**: Mock `useRouter`, `useSearchParams`

Never mock your own modules. Only mock system boundaries.

### Naming

- `describe()` uses the module/function name: `describe("lib/auth", ...)`, `describe("Nav", ...)`
- `it()` describes behavior: `it("returns null for missing slug", ...)`, `it("closes menu on link click", ...)`
- One logical assertion per test

---

## Coverage Thresholds

Enforced by `vitest.config.ts`:

| Metric | Threshold |
|--------|-----------|
| Branches | 94% |
| Functions | 95% |
| Lines | 95% |
| Statements | 95% |

Run `npm run test:coverage` before claiming any task is complete. Coverage must not decrease.

---

## Verification Checklist

Before completing any task, run ALL of:

```bash
npm test              # All tests pass
npm run test:coverage # Thresholds met, no decrease
npm run lint          # No lint errors
```

If any check fails, fix it before reporting done.
