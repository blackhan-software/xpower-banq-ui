# Code Review: XPower Banq UI

**Date**: 2026-02-22
**Scope**: Full codebase review (excluding `*.test.ts` / `*.test.tsx`)

---

## Executive Summary

XPower Banq UI is a well-structured DeFi lending/borrowing frontend for XPOW and APOW tokens on Avalanche. The codebase demonstrates strong architectural choices — strict TypeScript, event-driven blockchain sync, flyweight composite keys, and a clear separation between read (RemoteProvider) and write (WalletProvider) paths. The code is consistently well-organized with dot-namespaced components, one-function-per-directory utilities, and a thoughtful Zustand middleware stack.

That said, this review identifies **issues across 6 severity tiers** that should be addressed before or during production hardening. The most impactful themes are:

1. **Transaction UX relies on browser `alert`/`prompt`/`confirm` dialogs** — inadequate for financial operations
2. **Missing error boundaries around storage and provider operations** — can crash the app
3. **Race conditions in async sync services** — can produce stale or inconsistent state
4. **A `Position.supply` field is accessed but not declared in the type**
5. **`location.reload()` as a reconnection strategy** destroys in-flight user state

---

## Table of Contents

- [1. Critical Issues](#1-critical-issues)
- [2. High-Priority Issues](#2-high-priority-issues)
- [3. Medium-Priority Issues](#3-medium-priority-issues)
- [4. Low-Priority Issues](#4-low-priority-issues)
- [5. Architectural Observations](#5-architectural-observations)
- [6. Positive Patterns](#6-positive-patterns)

---

## 1. Critical Issues

### 1.1 Transaction Confirmation Uses Browser Dialogs

**Files**: `source/component/teller.exec/tx-runner.ts:85-91`, `source/component/my.portfolio/portfolio-body/tx-runner.ts`

The supply/borrow flow uses `prompt()` to collect the final amount and `confirm()` for lock operations:

```typescript
const amount_txt = `${prompt(
    `${label} ${t.symbol} (excl. a fee of ${fee_txt}): You may append ` +
    `"!" to *permanently* lock the ${mode} position. 🔒`,
    NUMEXP_FORMAT(amount),
)}`;
```

**Problems**:
- `prompt`/`confirm`/`alert` are synchronous and block the UI thread
- Markdown formatting (`*bold*`) renders as literal asterisks in native dialogs
- For a DeFi app handling real funds, native dialogs are trivially spoofable by browser extensions and provide no visual confirmation of what's being signed
- The lock mechanism (appending `!` to the amount string) is cryptic and non-discoverable

**Recommendation**: Replace with a purpose-built modal component showing transaction details, fees, lock toggle, and explicit Confirm/Cancel buttons.

---

### 1.2 Missing `supply` Property on `Position` Type

**File**: `source/type/position.ts:5-11, 62-63`

The `Position` type definition does not include a `supply` field:

```typescript
export type Position = Token & {
    capTotal: Record<Mode, [bigint, bigint]>;
    cap: Record<Mode, [bigint, bigint]>;
    lockedTotal: bigint;
    locked: bigint;
    amount: bigint;
    // no `supply` field
};
```

Yet `Position.supply()` accesses `position.supply`:

```typescript
supply(position: Position): Amount {
    return Number(position.supply) / Number(10n ** position.decimals);
},
```

And `sync-portfolio-by.ts:101-103` spreads `{ supply: total }` or `{ borrow: total }` into position objects, adding undeclared properties.

**Impact**: The code works at runtime due to JavaScript's dynamic nature, but this defeats TypeScript's type safety guarantees. Under strict mode, `position.supply` should be a compile error (and likely is suppressed by the spread pattern).

**Recommendation**: Add optional `supply?: bigint` and `borrow?: bigint` fields to the `Position` type, or restructure to store totals separately.

---

### 1.3 `localStorage` / `sessionStorage` Access Without Error Handling

**File**: `source/contract/base.ts:42-47, 58-68`

```typescript
let item = localStorage.getItem(key);
if (item === null && this._runner?.provider) {
    item = await this._runner.provider.getCode(this._target);
    localStorage.setItem(key, item);  // Can throw QuotaExceededError
}
```

**Problems**:
- `localStorage.setItem()` throws `QuotaExceededError` when quota is full
- Some browsers throw on any storage access in private/incognito mode
- If `setItem` fails, the fetched data is lost and won't be cached
- Contract bytecode can be large — storing many contracts may exhaust quota

**Impact**: App crash in private browsing or when storage is full. This affects every contract instantiation since `BaseContract.code()` and `BaseContract.memo()` both use this pattern.

**Recommendation**: Wrap all storage operations in try-catch; degrade gracefully to in-memory cache when storage is unavailable.

---

### 1.4 Hard Page Reload on WebSocket Provider Failure

**File**: `source/blockchain/ws-provider.ts:44-47`

```typescript
private reconnect() {
    this.dispose();
    location.reload();
}
```

**Problems**:
- Destroys all application state, in-flight transactions, and user input
- If the network is genuinely down, the reload will fail too — creating a reload loop
- No user notification before the reload occurs
- Could be triggered by transient network issues (3 failed keepalives)

**Recommendation**: Emit a reconnection event instead; let the application layer decide whether to show a "connection lost" banner, attempt to re-establish the WebSocket, or offer a manual reload button.

---

### 1.5 Division by Zero in `Health.wnav()`

**File**: `source/type/health.ts:25-36`

```typescript
wnav(health: Health, tokens: TokenInfo[]): number {
    const weights_sum = tokens.reduce((acc, t) => {
        const { weights: [borrow] } = t;
        return acc + borrow;
    }, 0);
    const weight_avg = (nav: Decimal) => {
        return nav.mul(tokens.length).mul(weights_max).div(weights_sum);
    };
    // ...
    return weight_avg(supply.sub(borrow)).toNumber();
},
```

If `tokens` is empty or all weights are zero, `weights_sum` is 0 and `Decimal.div(0)` throws.

This function is called from `sync-limits.ts:74` on every health/quote update. A throw here would propagate through the `buffered_ms` subscription and silently prevent limit calculations.

**Recommendation**: Guard against empty tokens and zero `weights_sum` at the top of the function.

---

## 2. High-Priority Issues

### 2.1 Race Condition in Sync Service Listener Registration

**File**: `source/zustand/service/sync-portfolio-by.ts:38-69`

When the pool or account changes, the service removes old listeners and attaches new ones. However, the listener attachment is async (awaiting `pool_contract[position_of](ta)` for each token), and the resulting unsubscribe Promise is stored in the `offs` Map at line 69:

```typescript
offs.set(pa_next, off);
```

If the pool/account changes again *before* this Promise resolves, the cleanup at lines 34-36 will try to await a Promise that may not yet be in the map, and the new listeners from the first change will never be unsubscribed.

**Recommendation**: Use a cancellation token or version counter; discard stale listener registrations when the pool/account changes before they complete.

---

### 2.2 Non-Atomic Multi-Setter State Updates

**File**: `source/zustand/service/sync-portfolio-by.ts:109-132`

The `update()` function calls two separate state setters:

```typescript
state.set_portfolio_supply(new_map);  // triggers subscribers
// ...
state.set_pool_supply(new_map);       // triggers subscribers again
```

Each setter triggers the Zustand subscription cycle independently, meaning `syncPortfolioHealth` could fire after the first setter with stale pool totals.

**Recommendation**: Combine into a single `set()` call that updates both values atomically.

---

### 2.3 Unlimited Token Approval via Ctrl+Click

**File**: `source/component/teller.exec/tx-runner.ts:141-143`

```typescript
const allowance_max = !ctrl
    ? Token.big(t, amount_num)
    : MaxUint256;
```

Holding Ctrl during a supply operation approves `MaxUint256` (unlimited) token spending for the pool contract — with no UI warning or confirmation.

**Impact**: If the pool contract were ever compromised, an unlimited approval would allow draining the user's entire token balance.

**Recommendation**: At minimum, show an explicit warning when unlimited approval is about to be granted. Consider defaulting to exact-amount approvals and requiring a separate UI action for unlimited approval.

---

### 2.4 PoW Nonce Validation and Magic Offset

**File**: `source/contract/pool.ts:252-264`

The PoW mining loop writes the nonce into the last 8 bytes of the transaction data, then slices with a hardcoded offset:

```typescript
return "0x" + hexlify(bytes).slice(106); // 2 + 64 + 40
```

**Problems**:
- The magic number `106` assumes a fixed layout of `blockHash(32 bytes = 64 hex) + address(20 bytes = 40 hex) + "0x" prefix(2)`. If any of these sizes change, it will silently produce invalid transaction data.
- The `runner.sendTransaction` assertion at line 133 happens *after* the expensive PoW computation rather than before it.

**Recommendation**: Calculate the slice offset dynamically from the input lengths; assert `runner.sendTransaction` before starting PoW.

---

### 2.5 Async Hook Race Conditions (Contract Hooks)

**File**: `source/react/hook/use-contract/use-vault-contract.ts:12-20`

```typescript
useEffect(() => {
    const va = pool?.vaultOf(token.address);
    Promise.resolve(va).then((a) => {
        if (a) set_vault(a);
    });
}, [token.address, pool?.target]);
```

No cancellation handling. If `token.address` changes before the promise resolves, the stale result will overwrite the state for the new token.

A similar pattern exists in `use-contract.ts:34-54` — though that one does have a `cancelled` flag. `useVaultContract` and `usePoolUtilCurr` lack it.

**Recommendation**: Add a `cancelled` flag (as done in `useContract`) to all async effects.

---

### 2.6 `OHLCData.inter()` Splice Index Mismatch

**File**: `source/type/ohlc-data.ts:37-63`

The interpolation function searches for the insertion index in the original `serie` array but splices into the growing `items` copy:

```typescript
const items = serie.slice();
for (...) {
    const index = serie.findIndex(({ t: my }) => dt.getTime() <= my.getTime());
    // ...
    items.splice(index, 0, { ... });  // index is relative to serie, not items
}
```

As items are inserted, the indices in `items` shift but the lookup still uses `serie` indices. The final `items.sort()` at line 64 masks this to some degree, but intermediate state is inconsistent and could produce duplicates.

**Recommendation**: Rebuild the array by iterating through the time range and pushing entries, rather than splicing by index.

---

## 3. Medium-Priority Issues

### 3.1 WebSocket Keep-Alive Race Condition

**File**: `source/blockchain/ws-provider.ts:20-41`

The keep-alive sets a timeout that increments `failures` if `getBlockNumber()` takes too long, but the catch block also increments `failures`. If a call both times out AND throws, the counter is double-incremented, potentially triggering an unnecessary reconnect (page reload).

The interval callback is also not cleared before running the next iteration, so multiple overlapping keepalive calls can stack up if `polling_ms` is less than the RPC response time.

---

### 3.2 `bs-html="true"` on Bootstrap Tooltips

**Files**: Multiple component files in `source/component/my.portfolio/portfolio-body/`

Several tooltip attributes use `bs-html="true"` with content generated by `render()`:

```tsx
title={render(title)} bs-html="true"
```

While the `render()` function converts JSX to HTML strings (not user input), enabling raw HTML in tooltips is a risky pattern. If any tooltip content ever includes data from the blockchain or external sources, it becomes an XSS vector.

**Recommendation**: Prefer plain-text tooltips; if rich content is needed, use a custom popover component with proper sanitization.

---

### 3.3 Silent Failures in `syncPortfolioLimits`

**File**: `source/zustand/service/sync-limits.ts:17-55`

Unlike `sync-amount.ts` and `sync-portfolio-by.ts` which use the `caught()` wrapper for error handling and retry, `syncPortfolioLimits` relies solely on `withActionGuard`'s catch. If `Health.wnav()` throws (e.g., division by zero per issue 1.5), the error is logged but limits are never recalculated.

**Recommendation**: Wrap the handler with the `caught()` error/retry mechanism used by other sync services.

---

### 3.4 `NaN` Propagation in Form Amount Input

**File**: `source/component/teller.form/form-amount.tsx:45-53`

```typescript
onChange={(e) => {
    const num_value = Number(e.target.value);
    const lhs_value = Math.max(min, num_value);
    const rhs_value = Math.min(max, lhs_value);
    // ...
}}
```

`Number("")` returns `0`, `Number("abc")` returns `NaN`. Since `Math.max(min, NaN)` returns `NaN` and `Math.min(max, NaN)` also returns `NaN`, invalid input propagates `NaN` into the store.

**Recommendation**: Use `Parser.number()` (already available in the codebase) or add an explicit `isFinite()` guard.

---

### 3.5 `bimax()` / `bimin()` on Empty Arrays

**File**: `source/function/bigint/bimax.ts:1-4`, `source/function/bigint/bimin.ts:1-4`

```typescript
export function bimax(...args: bigint[]): bigint {
    return args.reduce((max, bi) => (bi > max ? bi : max));
}
```

Calling `bimax()` with no arguments throws `TypeError: Reduce of empty array with no initial value`.

**Recommendation**: Either require at least one argument via TypeScript overloads, or provide a default initial value.

---

### 3.6 `Limit.eq()` Uses Weak Checksum

**File**: `source/type/limit.ts:12-15`

```typescript
checksum: (limits: Limit[]) => limits.reduce(
    (acc, l, i) => (acc + (1 + l.amount) * (1 + i)) % 0xffffffff, 0),
eq: (lhs_limits?, rhs_limits?) =>
    Limit.checksum(lhs_limits ?? []) === Limit.checksum(rhs_limits ?? []),
```

This arithmetic checksum is collision-prone — different limit arrays can produce the same checksum due to the modulo and the additive structure. Since this controls whether limit recalculations are skipped, a false positive means stale limits are served to the user.

**Recommendation**: Use element-wise comparison (length check + per-element `amount` and `token.address` comparison).

---

### 3.7 `Position.eq()` Uses `JSON.stringify` for Deep Comparison

**File**: `source/type/position.ts:65-66`

```typescript
eq: (lhs?: Position[], rhs?: Position[]): boolean =>
    JSON.stringify(lhs) === JSON.stringify(rhs),
```

`JSON.stringify` on objects containing `bigint` values throws `TypeError: Do not know how to serialize a BigInt`. The `Position` type contains `bigint` fields (`amount`, `locked`, `lockedTotal`, `cap`, `capTotal`).

**Impact**: This should throw at runtime. If it currently works, it's because the positions are being compared before bigint fields are populated, or there's a `BigInt.prototype.toJSON` polyfill.

**Recommendation**: Implement field-by-field comparison or ensure a `toJSON` polyfill is in place.

---

### 3.8 Incomplete Provider Error Handling

**File**: `source/blockchain/provider.ts:19-56`

Neither `WalletProvider()` nor `RemoteProvider()` wrap the provider construction in try-catch. If MetaMask is not installed and `detectProvider` returns `undefined`, or if the RPC URL is malformed, the error propagates uncaught.

**Recommendation**: Add try-catch around provider construction with meaningful error messages.

---

## 4. Low-Priority Issues

### 4.1 `useRef` Initialization with DOM Query

**File**: `source/component/teller.range/teller-range.tsx:10-11`

```tsx
const $ref = useRef<HTMLInputElement>(
    document.getElementById("teller-range") as HTMLInputElement
);
```

Direct DOM queries in ref initialization during render are not idiomatic React and will fail during SSR or if the element doesn't exist yet. Should use `useRef<HTMLInputElement>(null)` with a `ref` prop attachment.

---

### 4.2 Module-Level Mutable State in Components

**File**: `source/component/my.portfolio/portfolio-body/position-rate.tsx`

A module-level `SVG_CACHE = new Map<string, string>()` persists across renders with no invalidation or size limit. While unlikely to cause issues in practice, it's a potential memory leak if many unique SVGs are requested.

---

### 4.3 `Mode.modal()` Missing Exhaustive Return

**File**: `source/type/mode.ts:17-24`

```typescript
export function modal(mode: Mode): string {
    switch (mode) {
        case Mode.supply: return "supplied";
        case Mode.borrow: return "borrowed";
    }
    // implicit undefined return
}
```

TypeScript may or may not catch this depending on control flow analysis. Adding a `default: throw` or ensuring exhaustiveness would be safer.

---

### 4.4 Inconsistent Return Tuple Shapes in Hooks

Some hooks return `[state, setter] as const`, others return `[state] as const`. While individually correct, the inconsistency can confuse consumers. Consider documenting the convention.

---

### 4.5 No Error Handling in React Query Hooks

Multiple hooks using `useQuery` (e.g., `usePoolRateInfos`, `usePoolUtil`, `useOracleQuote`) don't provide `onError` callbacks. Failed queries are silently swallowed unless the consuming component explicitly checks `error` from the query result.

---

## 5. Architectural Observations

### 5.1 Sync Service Dependency Ordering

The six sync services in `with-sync.ts` have implicit ordering dependencies:
- `syncPortfolioHealth` depends on `portfolio_supply` and `portfolio_borrow`
- `syncPortfolioLimits` depends on `portfolio_health` and `oracle_quote`
- `syncPortfolioYields` depends on `portfolio_supply`, `portfolio_borrow`, and `pool_rate_info`

These dependencies are not documented or enforced. The `withActionGuard` mechanism handles loop prevention but doesn't guarantee ordering. Consider documenting the dependency graph explicitly (perhaps in a comment in `with-sync.ts`).

### 5.2 No Store Cleanup on Unmount

`withSync` registers event listeners via `store.subscribe()` but never provides a way to unsubscribe them. If the store were destroyed (e.g., during hot module replacement or testing), contract event listeners would remain active.

### 5.3 Dual-Provider Architecture

The separation of `RemoteProvider` (read-only, memoized) and `WalletProvider` (MetaMask, signing only) is an excellent pattern that minimizes wallet interaction prompts. The memoization prevents duplicate instances effectively.

### 5.4 URL Parameter System

The `ROParams` / `RWParams` split is clean. Read-only params control infrastructure behavior (devtools, logging, sync); read-write params control UI state (pool, mode, token, account) and enable deep-linking. The `history.pushState` sync is well-implemented.

---

## 6. Positive Patterns

The codebase exhibits several strong engineering practices worth highlighting:

- **TypeScript strict mode with maximum strictness**: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` — this is among the strictest TS configurations in production use
- **Flyweight composite keys** (`PoolToken`, `PoolAccount` via `RefManager`): Memory-efficient deduplication critical for Map-keyed state
- **Event-driven blockchain sync**: Contract event listeners (Transfer) instead of polling — efficient and real-time
- **Action guard loop prevention**: The `actions` array + `withActionGuard` pattern effectively prevents sync service feedback loops
- **Debounced derived state**: `buffered_ms()` for limits and yields prevents expensive recalculations on rapid state changes
- **Daily session versioning**: `__BANQ_SESSION_VERSION__` (epoch day) auto-expires stale blockchain data
- **One-function-per-directory utilities**: Clean isolation, easy to find and test
- **Dot-namespaced component directories**: Clear feature grouping (`app.*`, `teller.*`, `my.*`, `lib.*`, `page.*`)
- **Contract method caching**: `PoolContract` caches immutable lookups (`borrowOf`, `supplyOf`, `vaultOf`, `tokens`) in sessionStorage to minimize RPC calls
- **Proof-of-Work mining integration**: Client-side WASM mining with abort signal support is well-integrated with the transaction flow

---

## Summary by Severity

| Severity | Count | Key Theme |
|----------|-------|-----------|
| **Critical** | 5 | Browser dialogs for tx, missing type fields, storage crashes, forced reloads, division by zero |
| **High** | 6 | Race conditions, non-atomic updates, unlimited approval, PoW validation, async hooks, OHLC splice |
| **Medium** | 8 | WS keep-alive, HTML tooltips, silent sync failures, NaN propagation, weak equality checks |
| **Low** | 5 | Ref initialization, module caches, exhaustiveness, hook API consistency, query error handling |

**Total issues identified**: 24
