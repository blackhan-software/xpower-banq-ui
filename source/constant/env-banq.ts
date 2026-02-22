import { assert } from "@/function";
import { ROParams } from "@/url/ro-params";

// Whitepaper: IPFS hosted document
export const WHITEPAPER_URL = ROParams.get(["whitepaper-url"], String(import.meta.env[`BANQ_WHITEPAPER_URL`]));
assert(WHITEPAPER_URL, "missing WHITEPAPER_URL");
// Documentation: VitePress site
export const DOCS_URL = ROParams.get(["docs-url"], String(import.meta.env[`BANQ_DOCS_URL`] ?? ""));

// JSON provider: HTTP provider (or WS provider)
export const PROVIDER_URL = ROParams.get(["provider-url"], String(import.meta.env[`BANQ_PROVIDER_URL`]));
assert(PROVIDER_URL, "missing PROVIDER_URL");
// Contract runs: v10a, v10b etc.
export const CONTRACT_RUN = ROParams.get(["contract-run"], String(import.meta.env[`BANQ_CONTRACT_RUN`]));
assert(CONTRACT_RUN, "missing CONTRACT_RUN");
// APIs endpoint: database etc.
export const ENDPOINT_URL = ROParams.get(["endpoint-url"], String(import.meta.env[`BANQ_ENDPOINT_URL_${CONTRACT_RUN}`]));
assert(ENDPOINT_URL, "missing ENDPOINT_URL");

// NULL address: black magician
export const NULL_ADDRESS = ROParams.get([], 0n);
assert(NULL_ADDRESS == 0n, "missing NULL_ADDRESS");
// APOW address: token contract
export const APOW_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_APOW_ADDRESS_${CONTRACT_RUN}`]));
assert(APOW_ADDRESS >= 0n, "missing APOW_ADDRESS");
// XPOW address: token contract
export const XPOW_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_XPOW_ADDRESS_${CONTRACT_RUN}`]));
assert(XPOW_ADDRESS >= 0n, "missing XPOW_ADDRESS");
// AVAX address: token contract
export const AVAX_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_AVAX_ADDRESS_${CONTRACT_RUN}`]));
assert(AVAX_ADDRESS >= 0n, "missing AVAX_ADDRESS");
// USDC address: token contract
export const USDC_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_USDC_ADDRESS_${CONTRACT_RUN}`]));
assert(USDC_ADDRESS >= 0n, "missing USDC_ADDRESS");
// USDT address: token contract
export const USDT_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_USDT_ADDRESS_${CONTRACT_RUN}`]));
assert(USDT_ADDRESS >= 0n, "missing USDT_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T000_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_T000_ADDRESS_${CONTRACT_RUN}`]));
assert(T000_ADDRESS >= 0n, "missing T000_ADDRESS");
// Pool address: APOW/XPOW pool's contract
export const P000_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_P000_ADDRESS_${CONTRACT_RUN}`]));
assert(P000_ADDRESS >= 0n, "missing P000_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T001_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_T001_ADDRESS_${CONTRACT_RUN}`]));
assert(T001_ADDRESS >= 0n, "missing T001_ADDRESS");
// Pool address: APOW/AVAX pool's contract
export const P001_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_P001_ADDRESS_${CONTRACT_RUN}`]));
assert(P001_ADDRESS >= 0n, "missing P001_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T002_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_T002_ADDRESS_${CONTRACT_RUN}`]));
assert(T002_ADDRESS >= 0n, "missing T002_ADDRESS");
// Pool address: APOW/USDC pool's contract
export const P002_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_P002_ADDRESS_${CONTRACT_RUN}`]));
assert(P002_ADDRESS >= 0n, "missing P002_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T003_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_T003_ADDRESS_${CONTRACT_RUN}`]));
assert(T003_ADDRESS >= 0n, "missing T003_ADDRESS");
// Pool address: APOW/USDT pool's contract
export const P003_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_P003_ADDRESS_${CONTRACT_RUN}`]));
assert(P003_ADDRESS >= 0n, "missing P003_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T004_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_T004_ADDRESS_${CONTRACT_RUN}`]));
assert(T004_ADDRESS >= 0n, "missing T004_ADDRESS");
// Pool address: XPOW/AVAX pool's contract
export const P004_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_P004_ADDRESS_${CONTRACT_RUN}`]));
assert(P004_ADDRESS >= 0n, "missing P004_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T005_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_T005_ADDRESS_${CONTRACT_RUN}`]));
assert(T005_ADDRESS >= 0n, "missing T005_ADDRESS");
// Pool address: XPOW/USDC pool's contract
export const P005_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_P005_ADDRESS_${CONTRACT_RUN}`]));
assert(P005_ADDRESS >= 0n, "missing P005_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T006_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_T006_ADDRESS_${CONTRACT_RUN}`]));
assert(T006_ADDRESS >= 0n, "missing T006_ADDRESS");
// Pool address: XPOW/USDT pool's contract
export const P006_ADDRESS = ROParams.get([], BigInt(import.meta.env[`BANQ_P006_ADDRESS_${CONTRACT_RUN}`]));
assert(P006_ADDRESS >= 0n, "missing P006_ADDRESS");
