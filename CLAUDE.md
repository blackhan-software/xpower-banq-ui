# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XPower Banq UI is a DeFi lending and borrowing platform for XPOW and APOW tokens on Avalanche. Users can supply tokens to earn interest or borrow against their collateral across multiple liquidity pools. Built with React 19, TypeScript (strict mode), Zustand, and ethers.js. Bundled by Vite with multi-network support (mainnet/testnet).

## Development Commands

```bash
# Development (mode-specific)
npm run dev@mainnet    # Start dev server with mainnet config
npm run dev@testnet    # Start dev server with testnet config

# Building
npm run build          # Production build via Vite (mainnet)
npm run build@mainnet  # Explicit mainnet build
npm run build@testnet  # Testnet build

# Testing
npm test              # Run all tests with Vitest
npx vitest run <path> # Run a single test file
npm run test:coverage # Run tests with V8 coverage report

# Type Checking
npm run lint          # Type check without emitting files (tsc --noEmit)
npm run watch         # Continuous type checking

# Preview & Serve
npm run preview       # Preview production build
npm start            # Serve production build from dist/
```

## Architecture

### Source Layout

```
source/
├── main.tsx                 App bootstrap (React 19 StrictMode, QueryClient)
├── app.tsx                  Root component (BrowserRouter, shell layout)
├── main.scss, app.scss      Root stylesheets
│
├── app-theme/               SCSS theming system
│   ├── theme.scss           Aggregates bootstrap + palette + symbol
│   ├── bootstrap.scss       Bootstrap 5 variable overrides
│   ├── palette.scss         CSS custom properties (--xp-* color palette)
│   ├── symbol.scss          Token symbol colors
│   └── index.ts             JS color accessors (appTheme, magenta, lime, …)
│
├── blockchain/              Provider abstraction (Wallet + Remote)
├── contract/                Smart contract wrappers (Pool, Position, Vault, …)
├── constant/                Environment config, contract addresses, globals
├── type/                    Domain type definitions
├── function/                Utility library (one function per subdirectory)
│
├── react/                   React integration layer
│   ├── app-provider/        Composed context providers
│   ├── context/             React contexts (Accounts, ChainId, WalletStatus)
│   ├── element/             Typed HTML element wrappers (Div, Span, Button, …)
│   └── hook/                ~44 custom hooks
│
├── zustand/                 Central state management
│   ├── app-store.ts         Store definition (AppState interface + create)
│   ├── middleware/           withSwap → withDevtools → withSession
│   ├── service/             withLogger, withSync (6 blockchain sync services)
│   └── slice/               6 state slices
│
├── url/                     URL parameter system (ROParams, RWParams)
│
└── component/               UI components (dot-namespaced directories)
    ├── app.*/               Shell: navbar, footer, title, consent
    ├── lib.*/               Primitives: button, error-ui, fade-in, sector
    ├── teller.*/            Transaction interface: pool, mode, form, range, exec
    ├── my.portfolio/        Portfolio: health, yields, positions, charts
    └── page.home/           Page layout composing teller + portfolio
```

### Path Aliases

Configured in both `vite.config.ts` (resolve.alias) and `tsconfig.json` (paths). All `@/` aliases resolve to `source/`. Key aliases: `@/blockchain`, `@/component`, `@/constant`, `@/contract`, `@/function`, `@/react`, `@/type`, `@/url`, `@/zustand`.

### Application Bootstrap

**Entry** (`main.tsx`): Creates a `QueryClient` (staleTime from `ROParams.rqStaleTime`, default 2s), renders `<StrictMode>` → `<QueryClientProvider>` → `<AppProvider>` → `<App>` into `#app-root`.

**App** (`app.tsx`): BrowserRouter with a fixed layout — `<Header>` (AppNavbar), `<Main>` (route-based pages), `<Footer>` (AppFooter + AppConsent). Single route renders `<Home>`.

**AppProvider** (`react/app-provider/`): Composes three context providers:
```
ChainIdPro          Detects current EVM chain via MetaMask
  └─ AccountsPro    Requests and tracks wallet accounts
       └─ WalletStatusPro   Derives connection status (Ready | WrongNetwork | NoAccounts | NoProvider)
```

### Data Flow

```
                          ┌─────────────────────┐
                          │   Avalanche Chain    │
                          │  (Pool, Position,    │
                          │   Vault, Oracle,     │
                          │   ERC20 contracts)   │
                          └──────────┬──────────┘
                                     │
                      Contract events & RPC calls
                                     │
                          ┌──────────▼──────────┐
                          │   RemoteProvider     │
                          │ (JsonRpc / WebSocket)│
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Sync Services      │
                          │  (amount, supply,    │
                          │   borrow, health,    │
                          │   limits, yields)    │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Zustand Store      │
                          │  (AppState)          │
                          │                      │
                          │  oracle_quote        │
                          │  pool_*              │
                          │  portfolio_*         │
                          │  teller_*            │
                          │  wallet_account      │
                          └──────────┬──────────┘
                                     │
                              Custom Hooks
                                     │
                ┌────────────────────┬┴──────────────────┐
                │                    │                    │
        ┌───────▼──────┐    ┌───────▼──────┐    ┌───────▼──────┐
        │  Teller UI   │    │  Portfolio   │    │  App Shell   │
        │ (pool, mode, │    │ (health, APY,│    │ (navbar,     │
        │  form, range,│    │  positions,  │    │  footer,     │
        │  exec)       │    │  charts)     │    │  consent)    │
        └───────┬──────┘    └──────────────┘    └──────────────┘
                │
        ┌───────▼──────┐
        │  TxRunner    │
        │ (approve →   │
        │  supply/     │
        │  borrow)     │
        └───────┬──────┘
                │
        ┌───────▼──────┐
        │WalletProvider│
        │  (MetaMask   │
        │   signer)    │
        └──────────────┘
```

**Read path**: Chain → RemoteProvider → Sync Services → Zustand Store → Hooks → Components.

**Write path**: User action → TxRunner → WalletProvider (MetaMask signer) → Chain → Event emitted → Sync Services update store.

**Derived data**: Limits and yields are computed from other store slices with debounced recalculation.

### State Management (Zustand)

**Store** (`source/zustand/app-store.ts`): Single centralized store with six slices, defined in `source/zustand/slice/`:

| Slice         | Key State Fields                                                    | Map Key Type  |
|---------------|---------------------------------------------------------------------|---------------|
| **Oracle**    | `oracle_quote`                                                      | `PoolToken`   |
| **Pool**      | `pool`, `pool_tokens`, `pool_rate_model`, `pool_lock_params`, `pool_rate_info`, `pool_util_page`, `pool_util_curr`, `pool_util`, `pool_supply`, `pool_borrow` | `PoolToken` |
| **Portfolio** | `portfolio_amount`, `portfolio_limits`, `portfolio_supply`, `portfolio_borrow`, `portfolio_health`, `portfolio_yields` | `PoolAccount` |
| **Teller**    | `teller_mode`, `teller_token`, `teller_amount`, `teller_percent`, `teller_flag` | scalar |
| **Wallet**    | `wallet_account`                                                    | scalar        |
| **Actions**   | `actions` (tracks recently changed properties for loop prevention)  | `string[]`    |

Each state field has a corresponding `set_*` setter.

**Middleware stack** (`source/zustand/middleware/`): Conditionally applied based on ROParams:

```
create( withSession?( withDevtools?( withSwap( initializer ) ) ) )
```

| Middleware        | Purpose                                                           | Controlled By                              |
|-------------------|-------------------------------------------------------------------|--------------------------------------------|
| **withSwap**      | Reorders `set(partial, action, replace)` arguments for ergonomics | Always active                              |
| **withEqualizer** | Marks idempotent updates with `!` suffix in DevTools actions      | Applied inside withDevtools                |
| **withDevtools**  | Redux DevTools integration for time-travel debugging              | `ROParams.withDevtools` (dev: on, prod: off) |
| **withSession**   | `sessionStorage` persistence via Zustand `persist`                | `ROParams.withSession` (dev: off, prod: on) |

**Session persistence details**:
- Storage key: `"application-storage"`
- Version: epoch day (`__BANQ_SESSION_VERSION__`), triggers daily reset
- **Excluded** from persistence: `actions`, `teller_amount`, `teller_percent`
- Custom merge logic deserializes `PoolToken`-keyed and `PoolAccount`-keyed Maps from JSON on restore

**Services** applied after store creation: `withLogger` → `withSync`

**withLogger** (controlled by `ROParams.withLogger`): Subscribes to state changes and logs diffs with color-coded output (red: removed, lime: added, yellow: changed, cyan: equal).

**withSync** (controlled by `ROParams.withSync`): Orchestrates six blockchain sync services, each injected with `RemoteProvider`:

| Service                  | Triggers On                          | Listens To                        | Updates                                |
|--------------------------|--------------------------------------|-----------------------------------|----------------------------------------|
| `syncPortfolioAmount`    | wallet/pool change                   | ERC20 Transfer events             | `portfolio_amount`                     |
| `syncPortfolioSupply`    | wallet/pool change                   | Position Transfer events (supply) | `portfolio_supply`, `pool_supply`      |
| `syncPortfolioBorrow`    | wallet/pool change                   | Position Transfer events (borrow) | `portfolio_borrow`, `pool_borrow`      |
| `syncPortfolioHealth`    | supply/borrow Transfer events        | Derived from above                | `portfolio_health`                     |
| `syncPortfolioLimits`    | health, oracle_quote, pool_tokens    | Derived, debounced                | `portfolio_limits`                     |
| `syncPortfolioYields`    | supply, borrow, rate_info, quote     | Derived, debounced                | `portfolio_yields`                     |

**Sync pattern**: Subscribe to store → detect relevant changes → remove old contract event listeners → attach new listeners → fetch fresh data on events → update store only if values changed (using `Position.eq`, `Health.eq`).

**Loop prevention**: The `actions` array tracks which properties were just set. Sync services use `withActionGuard` to skip re-triggering themselves. Derived services (limits, yields) use `buffered_ms()` debouncing.

### URL Parameter System

**ROParams** (`source/url/ro-params.ts`): Read-only, parsed from query string at startup:

| Parameter        | Type     | Default (dev / prod)     | Purpose                          |
|------------------|----------|--------------------------|----------------------------------|
| `with-devtools`  | boolean  | on / off                 | Zustand DevTools                 |
| `with-logger`    | Level    | on / off                 | Console logging service          |
| `with-session`   | boolean  | off / on                 | sessionStorage persistence       |
| `with-sync`      | boolean  | on / on                  | Blockchain sync services         |
| `rq-stale-time`  | number   | 2000                     | React Query stale time (ms)      |
| `contract-run`   | string   | from env                 | Contract version override        |
| `provider-url`   | string   | from env                 | RPC provider URL override        |

**RWParams** (`source/url/rw-params.ts`): Read-write, synced to URL via `history.pushState`:

| Parameter   | Type    | Purpose                       |
|-------------|---------|-------------------------------|
| `account`   | Account | Connected wallet address      |
| `portfolio` | boolean | Portfolio panel visibility    |
| `pool`      | Pool    | Currently selected pool       |
| `mode`      | Mode    | Supply or borrow              |
| `token`     | Token   | Currently selected token      |

Enables deep-linking and shareable UI state.

### Blockchain Integration

**Provider System** (`source/blockchain/provider.ts`):

| Provider          | Backend                          | Usage                                          |
|-------------------|----------------------------------|-------------------------------------------------|
| `WalletProvider`  | MetaMask `BrowserProvider`       | Signing transactions (supply, borrow, approve)  |
| `RemoteProvider`  | `JsonRpcProvider` or `WebSocketProvider` | Read-only data queries (balances, positions, health) |

Both are memoized to prevent duplicate instances. WebSocket providers include keep-alive ping and auto-reload on timeout.

**Smart Contracts** (`source/contract/`):

| Contract            | Extends                  | Purpose                                          | Caching                                     |
|---------------------|--------------------------|--------------------------------------------------|----------------------------------------------|
| `BaseContract`      | —                        | Abstract base with lazy contract instantiation   | Contract code in localStorage               |
| `PoolContract`      | `BaseContract`           | Core pool operations: supply, borrow, redeem, settle | `borrowOf`, `supplyOf`, `vaultOf`, `tokens` in sessionStorage |
| `PositionContract`  | `ERC20Contract`          | User position tracking (balanceOf, lockOf, totalSupply) | —                                    |
| `VaultContract`     | `BaseContract`           | Token vault management (fee queries)             | —                                            |
| `OracleContract`    | `BaseContract`           | Price feed queries (bid/ask/mid quotes)          | —                                            |
| `ERC20Contract`     | `BaseContract`           | Standard ERC-20 interactions (balanceOf, approve, allowance) | —                                |

ABI JSON files colocated alongside contract classes.

**Transaction Execution** (`source/component/teller.exec/tx-runner.ts`): Two-phase flow:
- **Supply**: validate amount → check/request ERC-20 allowance → optional lock confirmation (with spread waiver info) → `pool.supply()` with optional PoW nonce
- **Borrow**: validate amount → optional lock confirmation (with malus/spread info) → `pool.borrow()` with optional PoW nonce
- Contract-specific revert reasons: `AbsoluteCapExceeded`, `RelativeCapExceeded`, `PowLimited`, `RateLimited`, `CapLimited`

**Proof-of-Work Mining**: Some supply/borrow operations require client-side PoW nonce calculation via `@blackhan-software/wasm-miner` (KeccakHasher). Only required when `supplyDifficultyOf` or `borrowDifficultyOf` returns non-zero.

### Component Architecture

Components in `source/component/` follow a **dot-namespaced directory** convention: `{category}.{name}/`

| Prefix     | Purpose                        | Components                                    |
|------------|--------------------------------|-----------------------------------------------|
| `app.*`    | Application shell              | navbar, footer, title, consent                |
| `lib.*`    | Reusable primitives            | button (IconButton), error-ui, fade-in, sector (SVG arc) |
| `teller.*` | Supply/borrow transaction UI   | pool, mode, form, range, exec                 |
| `my.*`     | User portfolio                 | portfolio (head, body, charts)                |
| `page.*`   | Full-page layouts              | home                                          |

Each directory contains: `index.ts` (barrel), primary `.tsx` file(s), optional colocated `.scss`.

**Composition tree**:

```
App
├── AppNavbar ─── AppWallet (account selector, QR code, keyboard nav)
├── Home
│   ├── TellerPool ─── ListPool, PrevPool, NextPool
│   ├── TellerMode ─── SupplySelector, BorrowSelector
│   ├── TellerForm
│   │   ├── FormAmount (number input with wheel/bounds/auto-focus)
│   │   └── FormTokens (dropdown with SVG token icons)
│   ├── TellerRange (percentage slider with gradient fill)
│   ├── TellerExec ─── ExecToggle, ExecLabel, ExecInfo, Pulsar button
│   └── MyPortfolio
│       ├── PortfolioHead ─── PortfolioHealth, PortfolioAPY
│       └── PortfolioBody (accordion of positions)
│           ├── PortfolioPosition (toggle, label, amount, rate, handle)
│           └── PositionCharts ─── ChartQuotes (OHLC), ChartUtils (utilization)
├── AppFooter ─── contract links, social links, terms
└── AppConsent (cookie consent with localStorage persistence)
```

**Component patterns**:
- Functional components only — no class components
- Sub-components as plain functions receiving destructured hook returns:
  ```tsx
  function SupplySelector([mode, set_mode]: ReturnType<typeof useTellerMode>) { … }
  ```
- `ForwardRef` used for `IconButton` (imperative DOM control)
- Typed HTML wrappers (`Div`, `Span`, `Button`, `Input`, etc.) from `react/element/` provide consistent prop typing
- Keyboard navigation: `Ctrl+Arrow` cycles pools; `Ctrl+Shift+Arrow` cycles accounts; `Escape` clears focus
- Mouse wheel support on pool selector and account selector for scrolling through items
- Lazy chart loading: Charts render only when their accordion section opens (`show.bs.collapse` event)

**Styling**:
- Bootstrap 5 via SCSS with variable overrides in `app-theme/bootstrap.scss`
- CSS custom properties for the color palette (`--xp-magenta`, `--xp-lime`, `--xp-gray`, etc.) defined in `palette.scss`, with dark, inverted (`-i`), and opacity (`-25`, `-50`, `-75`) variants
- Component-scoped SCSS files colocated alongside `.tsx` files
- Responsive design: Bootstrap utility classes, media queries, `mobile()` utility for UA detection
- Dynamic CSS: Range slider uses `--xp-percent` custom property for gradient fill position. Symbol colors set dynamically per token.

### React Integration (`source/react/`)

**Custom hooks** (`react/hook/`): ~44 hooks organized by category:

- **Store hooks** (~21): Thin Zustand wrappers — `usePool`, `useTellerMode`, `useTellerToken`, `useTellerAmount`, `useTellerPercent`, `useTellerFlag`, `useWalletAccount`, `usePortfolioHealth`, `usePortfolioYield`, `usePortfolioAmount`, `usePortfolioLimit`, `usePortfolioCap`, `usePoolTokens`, `usePoolUtil`, `usePoolUtilCurr`, `usePoolTotals`, `usePoolRateInfos`, `usePoolRateModels`, `usePoolLockParams`, `useOracleQuote`, `usePoolAccount`, `usePortfolio`
- **Contract hooks** (~9): Instantiate and cache contracts — `useContract`, `useContracts`, `usePoolContract`, `usePositionContract`, `usePositionContracts`, `useTokenContracts`, `useVaultContract`, `useVaultContracts`, `useOracleContract`
- **Provider hooks**: `useRemoteProvider`, `useWalletProvider`
- **Wallet hooks**: `useWalletAccounts`, `useWalletChainId`, `useWalletConnect`, `useWalletStatus`
- **UI hooks**: `useKeyDown`, `useKeyUp`, `useDoubleTap`, `useMouseDragX`, `useMouseDragY`, `useMouseDrag`, `useTimeout`, `useJson`

**Context providers** (`react/context/`):

| Context            | Provider           | Value                              |
|--------------------|--------------------|------------------------------------|
| `ChainIdCtx`       | `ChainIdPro`       | Current EVM chain ID               |
| `AccountsCtx`      | `AccountsPro`      | Array of connected wallet accounts |
| `WalletStatusCtx`  | `WalletStatusPro`  | Connection status enum             |

**Data fetching**:
- React Query (TanStack) for OHLC prices (`useQuotes`, 24h stale time, bidirectional quote merging) and utilization data (`useUtils`, 24h stale time, supply/borrow rate merging)
- Contract event listeners for on-chain state via sync services (not React Query)

### Environment Configuration

**Multi-network support**:
- `.env` — Minimal defaults (whitepaper URL)
- `.env.mainnet` / `.env.testnet` — Full contract addresses per network
- `.env.*.local` — Local overrides (gitignored)
- All env vars prefixed `BANQ_` (via `vite.config.ts` `envPrefix`)

**Contract versioning** (`source/constant/env-banq.ts`):
- `BANQ_CONTRACT_RUN` (e.g., `v10a`, `v10b`) selects the address set
- All addresses suffixed with version: `BANQ_P000_ADDRESS_${CONTRACT_RUN}`
- 7 pools (P000–P006) and 7 EWMA oracles (T000–T006)

**Build-time defines** (`vite.config.ts`):

| Define                       | Value                  | Purpose                    |
|------------------------------|------------------------|----------------------------|
| `__BANQ_PACKAGE_VERSION__`   | from `package.json`    | Display version            |
| `__BANQ_SESSION_VERSION__`   | epoch day number       | Daily session storage reset|

**Vite configuration**: 14 path aliases, chunk size warning at 4096 KB, dev server at `0.0.0.0:5173`.

### Type System (`source/type/`)

**Core identifiers**:
- `Pool` — `bigint` pool address with static lookups (`Pool.name()`, `Pool.token()`, `Pool.from()`)
- `Token` — `{ address, decimals, supply, symbol }` with conversion utilities (`Token.big()`, `Token.amount()`)
- `Account` — `bigint` wallet address
- `Address` — `string | Promise<string>`

**Composite keys** (flyweight pattern via `RefManager`):
- `PoolToken` — `{ pool, token }`, uniquely cached by `${pool}:${token}`
- `PoolAccount` — `{ pool, account }`, uniquely cached by `${pool}:${account}`
- Both provide `.map(json)` for deserializing Maps from session storage

**Portfolio data**:
- `Position` — Token position with `amount`, `cap`, `capTotal`, `locked`, `lockedTotal`, `supply`. Static comparison via `Position.eq()`
- `Health` — `{ borrow, supply }` as bigints. Derives `ratio()` (supply/borrow via Decimal.js) and `wnav()` (weighted net asset value)
- `Limit` — Per-token borrow limit (99.9% of max)
- `Rate` / `RateModel` / `RateInfo` — Interest rate parameters and utilization-based rate calculation

**Supporting types**:
- `Mode` — `"supply" | "borrow"` enum
- `Quote` — Oracle price with bid/ask/mid
- `LockParams` — Bonus (supply) / malus (borrow) for locked positions
- `VaultFee` — Entry/exit fee structures with `percent()` / `permille()` conversion
- `OHLCData` — Candlestick data with interpolation/extrapolation utilities
- `TimeSerie` — Time series with weighted averaging
- `PoolList` — Array of pool descriptors with query, next/prev navigation

**Base aliases**: `Seconds = number`, `Amount = number`, `Percent = number`, `Rate = number`, `Total = bigint`.

**Type-level utilities**: `OmitKeys<T, Prefix>`, `PickKeys<T, Prefix>`, `Nullable<T>`.

### Utility Library (`source/function/`)

Each utility occupies its own subdirectory with a primary `.ts` file and optional `.test.ts`:

| Utility          | Key Exports                                              |
|------------------|----------------------------------------------------------|
| `address-of`     | `addressOf(n)` checksummed hex; `abbressOf(n)` truncated |
| `assert`         | `assert(expr, msg)` with `AssertError`                   |
| `bigint`         | `bimax(...bigint[])`, `bimin(...bigint[])`               |
| `buffered`       | `buffered(fn, ms)` debounce with `.cancel()`; `buffered_if`, `buffered_ms` variants |
| `cap`            | `cap(n, min, max)` clamp                                 |
| `cycle`          | `Cycle.next()`, `Cycle.prev()`, `Cycle.rotate()` circular array navigation |
| `dot`            | `dot(text)` append period; `cap(text)` capitalize        |
| `epoch-time`     | `epochTime(unit_ms)` for session versioning              |
| `fixed`          | `fixed(n, decimals)` fixed-point formatting              |
| `format`         | `KMG_FORMAT`, `NUM_FORMAT`, `EXP_FORMAT`, `NUMEXP_FORMAT` |
| `humanize`       | Human-readable formatting                                |
| `memoized`       | `memoized(fn, keyOf?)` function memoization              |
| `mobile`         | `mobile()` / `nomobi()` UA-based detection               |
| `nice`           | `nice(n, opts)` thousands separator; `niceSI(n)` SI prefix |
| `off-all/on-all` | Batch event listener management                          |
| `omit/pick`      | Object key filtering                                     |
| `ordinal`        | `ordinal(n)` → "1st", "2nd", etc.                       |
| `parser`         | `Parser.boolean/number/bigint/string/object` with fallbacks |
| `polyfill`       | Browser polyfills                                        |
| `query-key`      | React Query key generation                               |
| `random`         | `random(min, max)`                                       |
| `range`          | `range()` / `bigRange()` generators                      |
| `ref-manager`    | `RefManager` flyweight instance cache                    |
| `render`         | `render(component)` → HTML string                        |
| `sleep`          | `sleep(ms)` delay promise                                |
| `version`        | Version parsing                                          |
| `with-retry`     | `withRetry(fn, opts)` retry with backoff                 |
| `zip`            | `zip(lhs, rhs)` → `[T, U, index][]`                     |

## Important Implementation Details

1. **TypeScript Strictness**: Full strict mode plus `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, and all strict flags. All code must pass `npm run lint`.

2. **Contract Method Caching**: `PoolContract` caches `borrowOf`, `supplyOf`, `vaultOf`, `tokens` in sessionStorage to minimize RPC calls.

3. **Session Versioning**: State resets daily via `__BANQ_SESSION_VERSION__` (epoch day) to prevent stale blockchain data.

4. **Event-Driven Sync**: Blockchain data flows via contract event listeners (Transfer events), not polling. Sync services dynamically attach/detach listeners when pool or account changes.

5. **Loop Prevention**: The `actions` array in the store tracks which properties were just set. Sync services use `withActionGuard` (from `action-guard.ts`) to skip re-triggering themselves.

6. **Dual Provider Architecture**: `RemoteProvider` (read-only, memoized) for data queries; `WalletProvider` (MetaMask) only for signing transactions. Minimizes wallet prompts.

7. **Flyweight Composite Keys**: `PoolToken` and `PoolAccount` use `RefManager` for memory-efficient instance deduplication, critical for Map keys across the store.

8. **Debounced Derived State**: Limits and yields use `buffered_ms()` to throttle expensive recalculations that depend on multiple rapidly-changing inputs.

9. **Testing**: Unit tests colocated with source using `*.test.ts` naming. No separate vitest config — Vitest runs via `package.json` script with Vite's config. Shared test helpers in `test/` (aliased as `@/test`): `stubGlobals()` stubs browser APIs (`sessionStorage`, `localStorage`, `location`); `mockRunner` and `mockFunction` provide typed mocking; `MOCK_CONSTANTS` supplies test fixtures.
