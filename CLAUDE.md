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

### CI Pipeline

CI runs on push and PRs to `main` (Node 22): `npm run lint` → `npm run test:coverage`. Coverage thresholds: 60% minimum for lines, functions, branches, and statements.

## Architecture Essentials

**Path aliases**: All `@/` aliases resolve to `source/`, configured in both `vite.config.ts` and `tsconfig.json`.

**Bootstrap**: `main.tsx` creates QueryClient → StrictMode → QueryClientProvider → AppProvider → App. AppProvider nests three context providers: ChainIdPro → AccountsPro → WalletStatusPro.

**Data flow**: Read path: Chain → RemoteProvider → Sync Services → Zustand Store → Hooks → Components. Write path: User action → TxRunner → WalletProvider (MetaMask signer) → Chain → Event → Sync Services update store.

### Zustand Store

Single centralized store (`source/zustand/app-store.ts`) with six slices. Each state field has a corresponding `set_*` setter.

| Slice         | Key State Fields                                                    | Map Key Type  |
|---------------|---------------------------------------------------------------------|---------------|
| **Oracle**    | `oracle_quote`                                                      | `PoolToken`   |
| **Pool**      | `pool`, `pool_tokens`, `pool_rate_model`, `pool_lock_params`, `pool_rate_info`, `pool_util_page`, `pool_util_curr`, `pool_util`, `pool_supply`, `pool_borrow` | `PoolToken` |
| **Portfolio** | `portfolio_amount`, `portfolio_limits`, `portfolio_supply`, `portfolio_borrow`, `portfolio_health`, `portfolio_yields` | `PoolAccount` |
| **Teller**    | `teller_mode`, `teller_token`, `teller_amount`, `teller_percent`, `teller_flag` | scalar |
| **Wallet**    | `wallet_account`                                                    | scalar        |
| **Error**     | `errors` (per-service error state)                                  | scalar        |
| **Actions**   | `actions` (tracks recently changed properties for loop prevention)  | `string[]`    |

**Middleware stack**: `create( withSession?( withDevtools?( withSwap( initializer ) ) ) )` — conditionally applied based on `ROParams`.

**Session persistence**: Storage key `"application-storage"`, version resets daily via `__BANQ_SESSION_VERSION__` (epoch day). Excluded from persistence: `actions`, `errors`, `teller_amount`, `teller_percent`. Custom merge logic deserializes `PoolToken`-keyed and `PoolAccount`-keyed Maps from JSON on restore.

**Sync services** (controlled by `ROParams.withSync`): Six services (`syncPortfolioAmount`, `syncPortfolioSupply`, `syncPortfolioBorrow`, `syncPortfolioHealth`, `syncPortfolioLimits`, `syncPortfolioYields`) subscribe to store changes, attach/detach contract event listeners, and update store when events fire. Loop prevention: the `actions` array tracks which properties were just set; sync services use `withActionGuard` to skip re-triggering themselves. Derived services (limits, yields) use `buffered_ms()` debouncing.

### Environment & URL Parameters

**Environment variables**: Prefixed `BANQ_*` (Vite `envPrefix`). Base `.env`, network-specific `.env.mainnet`/`.env.testnet`, and gitignored `.env.*.local` overrides. Key vars: `BANQ_PROVIDER_URL`, `BANQ_CONTRACT_RUN` (e.g. `v10a`), token/pool/oracle addresses suffixed by contract run (e.g. `BANQ_APOW_ADDRESS_v10a`).

**URL parameters**: `ROParams` (read-only, from query string with env fallback) controls runtime flags like `withSync`, `withDevtools`. `RWParams` (read-write) syncs UI state to URL: account, pool, mode, token, portfolio selection.

## Important Implementation Details

1. **TypeScript Strictness**: Full strict mode plus `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, and all strict flags. All code must pass `npm run lint`.

2. **Contract Method Caching**: `PoolContract` caches `borrowOf`, `supplyOf`, `vaultOf`, `tokens` in sessionStorage to minimize RPC calls.

3. **Session Versioning**: State resets daily via `__BANQ_SESSION_VERSION__` (epoch day) to prevent stale blockchain data.

4. **Event-Driven Sync**: Blockchain data flows via contract event listeners (Transfer events), not polling. Sync services dynamically attach/detach listeners when pool or account changes.

5. **Loop Prevention**: The `actions` array in the store tracks which properties were just set. Sync services use `withActionGuard` (from `action-guard.ts`) to skip re-triggering themselves.

6. **Dual Provider Architecture**: `RemoteProvider` (read-only, memoized) for data queries; `WalletProvider` (MetaMask) only for signing transactions. Minimizes wallet prompts.

7. **Flyweight Composite Keys**: `PoolToken` and `PoolAccount` use `RefManager` for memory-efficient instance deduplication, critical for Map keys across the store.

8. **Debounced Derived State**: Limits and yields use `buffered_ms()` to throttle expensive recalculations that depend on multiple rapidly-changing inputs.

9. **Proof-of-Work**: `PoolContract.supply()` and `PoolContract.borrow()` check on-chain difficulty; if > 0, they use `@blackhan-software/wasm-miner` (Keccak-based PoW) to generate a nonce before submitting the transaction.

10. **Contract Run Versioning**: Addresses are namespaced by contract run (e.g. `v10a`). The active run is set via `BANQ_CONTRACT_RUN` env var. This allows deploying new contract versions without breaking existing ones.

## Testing

Unit tests colocated with source using `*.test.ts` naming. No separate vitest config — Vitest runs via `vite.config.ts`. Default test environment is `node`; component/hook tests that need DOM must add `// @vitest-environment jsdom` as the first line. Shared test helpers in `test/` (aliased as `@/test`): `stubGlobals()`, `mockRunner`, `mockFunction`, `createWrapper`, `MOCK_CONSTANTS`.

**Test mocking pattern**: Tests that use domain types (`Pool`, `Token`, etc.) or constants must mock `@/constant` and `@/function` at the top of the file, *before* importing the code under test:

```ts
// @vitest-environment jsdom
import { stubGlobals } from "@/test";
stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

// Now import code under test
import { Pool } from "@/type";
```

For testing hooks that need `QueryClientProvider`, use `createWrapper`:
```ts
// @vitest-environment jsdom
import { createWrapper } from "@/test";
renderHook(() => useMyHook(), { wrapper: createWrapper() });
```
