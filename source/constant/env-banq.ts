import { assert } from "@/function";
import { ROParams } from "@/url/ro-params";

// JSON provider: HTTP provider (or WS provider)
export const PROVIDER_URL = ROParams.get(["provider-url"], String(import.meta.env['BANQ_PROVIDER_URL']));
assert(PROVIDER_URL, "missing PROVIDER_URL");
// NULL address: black magician
export const NULL_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_NULL_ADDRESS']));
assert(NULL_ADDRESS === 0n, "missing NULL_ADDRESS");
// APOW address: token contract
export const APOW_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_APOW_ADDRESS']));
assert(APOW_ADDRESS, "missing APOW_ADDRESS");
// XPOW address: token contract
export const XPOW_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_XPOW_ADDRESS']));
assert(XPOW_ADDRESS, "missing XPOW_ADDRESS");
// AVAX address: token contract
export const AVAX_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_AVAX_ADDRESS']));
assert(AVAX_ADDRESS, "missing AVAX_ADDRESS");
// USDC address: token contract
export const USDC_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_USDC_ADDRESS']));
assert(USDC_ADDRESS, "missing USDC_ADDRESS");
// USDT address: token contract
export const USDT_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_USDT_ADDRESS']));
assert(USDT_ADDRESS, "missing USDT_ADDRESS");

// Seer address: EWMA price-tracker oracle
export const T000_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_T000_ADDRESS']));
assert(T000_ADDRESS, "missing T000_ADDRESS");
// Pool address: APOW/XPOW pool's contract
export const P000_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_P000_ADDRESS']));
assert(P000_ADDRESS, "missing P000_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T001_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_T001_ADDRESS']));
assert(T001_ADDRESS, "missing T001_ADDRESS");
// Pool address: APOW/AVAX pool's contract
export const P001_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_P001_ADDRESS']));
assert(P001_ADDRESS, "missing P001_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T002_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_T002_ADDRESS']));
assert(T002_ADDRESS, "missing T002_ADDRESS");
// Pool address: APOW/USDC pool's contract
export const P002_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_P002_ADDRESS']));
assert(P002_ADDRESS, "missing P002_ADDRESS");
// Seer address: EWMA price-tracker oracle
export const T003_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_T003_ADDRESS']));
assert(T003_ADDRESS, "missing T003_ADDRESS");
// Pool address: APOW/USDT pool's contract
export const P003_ADDRESS = ROParams.get([], BigInt(import.meta.env['BANQ_P003_ADDRESS']));
assert(P003_ADDRESS, "missing P003_ADDRESS");
