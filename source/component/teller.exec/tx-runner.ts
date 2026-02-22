import { WalletProvider } from "@/blockchain";
import { CONTRACT_RUN, UNIT } from "@/constant";
import { ERC20Contract, PoolContract, PositionContract, VaultContract } from "@/contract";
import { assert, cap, dot, humanize, KMG_FORMAT, NUM_FORMAT, NUMEXP_FORMAT, Parser, v, addressOf as x } from "@/function";
import { Account, Address, Amount, Mode, Pool, Token, VaultFee } from "@/type";
import { CallExceptionError, Interface, isCallException, MaxUint256 } from "ethers";

import POOL_ABI from "@/contract/pool-abi.json";
import POSITION_ABI from "@/contract/position-abi.json";

type TxContext = {
    address: Address;
    pool: PoolContract;
    token: ERC20Contract;
    vault: VaultContract;
}
type TxData = {
    signal: AbortSignal | null;
    amount: Amount | null;
    token: Token;
    ctrl: boolean;
}
type TxFlow = {
    fee(ctx: TxContext): Promise<string>;
    lock(ctx: TxContext, t: Token, amount: Amount): Promise<string>;
    exec(pool: PoolContract, token: Address, amount: bigint, lock: boolean,
        ctx: { address: Address; signal: AbortSignal | null }): Promise<{ wait(n: number): Promise<unknown> }>;
    approve?(ctx: TxContext, data: TxData, amount: number): Promise<void>;
}
const SUPPLY_FLOW: TxFlow = {
    fee: supply_fee,
    lock: supply_lock,
    exec: (pool, ...args) => pool.supply(...args),
    approve: supply_approve,
};
const BORROW_FLOW: TxFlow = {
    fee: borrow_fee,
    lock: borrow_lock,
    exec: (pool, ...args) => pool.borrow(...args),
};
export async function TxRunner(
    account: Account | null,
    pool_address: Pool,
    mode: Mode,
    data: TxData,
) {
    const runner = await WalletProvider();
    assert(runner, "missing provider");
    const signer = await runner.getSigner(
        account ? x(account) : 0
    );
    assert(signer, "missing signer");
    const address = await signer.getAddress();
    assert(address, "missing account");
    const pool = new PoolContract(
        x(pool_address), signer,
    );
    const token = new ERC20Contract(
        x(data.token.address), signer,
    );
    const vault = new VaultContract(
        await pool.vaultOf(token.target), signer
    );
    if (mode === Mode.supply) {
        return execute({ address, pool, token, vault }, data, mode, SUPPLY_FLOW);
    }
    if (mode === Mode.borrow) {
        return execute({ address, pool, token, vault }, data, mode, BORROW_FLOW);
    }
    throw new Error("invalid mode");
}
async function execute(
    ctx: TxContext, data: TxData, mode: Mode, flow: TxFlow,
) {
    const { address, pool } = ctx;
    const { amount, token: t } = data;
    const label = cap(mode);
    //
    // Check if amount is valid:
    //
    if (!amount) {
        return alert(`${label} ${t.symbol}: ${zero_error()}`);
    }
    const fee_txt = await flow.fee(ctx);
    const amount_txt = `${prompt(
        `${label} ${t.symbol} (excl. a fee of ${fee_txt}): You may append ` +
        `"!" to *permanently* lock the ${mode} position. 🔒`,
        NUMEXP_FORMAT(amount),
    )}`;
    if (amount_txt === "null") {
        return; // cancel
    }
    const amount_num = Parser.number(
        amount_txt.replace("!", ""), 0,
    );
    if (!amount_num) {
        return alert(`${label} ${t.symbol}: ${zero_error()}`);
    }
    //
    // Check if approval is required:
    //
    if (flow.approve) {
        await flow.approve(ctx, data, amount_num);
    }
    //
    // Check if lock is requested:
    //
    const lock = amount_txt.endsWith("!");
    if (lock) {
        if (!confirm(await flow.lock(ctx, t, amount_num))) {
            return;
        }
    }
    //
    // Try to execute transaction:
    //
    const amount_big = Token.big(t, amount_num);
    try {
        const tx = await flow.exec(pool, t.address, amount_big, lock, {
            address, signal: data.signal,
        });
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
            return; // user pressed Escape
        }
        if (isCallException(e)) {
            return alert(`${label} ${t.symbol}: ${call_error(t, e)}`);
        }
        throw e;
    }
}
async function supply_approve(
    ctx: TxContext, data: TxData, amount_num: number,
) {
    const { address, pool, token } = ctx;
    const { token: t, ctrl } = data;
    const allowance_big = await token.allowance(
        address, pool.target,
    );
    const allowance_max = !ctrl
        ? Token.big(t, amount_num)
        : MaxUint256;
    if (allowance_big < allowance_max) try {
        const tx = await token.approve(
            pool.target, allowance_max
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(e.reason ?? e.shortMessage);
        }
        throw e;
    }
}
async function supply_lock(
    ctx: TxContext, { symbol }: Token, amount: Amount
) {
    const amount_kmg = KMG_FORMAT(3)(amount);
    const message = [
        `You are about to supply ${amount_kmg} ${symbol} with a *lock*`,
        `— but you *cannot redeem* that principal ever! 💀`
    ].join(" ");
    if (v(CONTRACT_RUN) > v("10a")) {
        return message + "\n\n" + [
            `In exchange, you will earn interest at the full base rate`,
            `— instead of the reduced supply rate (i.e. the protocol's`,
            `spread of ±${await spread(ctx, (t) => ctx.pool.supplyOf(t))} is waived). ✨`
        ].join(" ");
    }
    return message;
}
async function borrow_lock(
    ctx: TxContext, { symbol }: Token, amount: Amount
) {
    const amount_kmg = KMG_FORMAT(3)(amount);
    const message = [
        `You are about to borrow ${amount_kmg} ${symbol} with a *lock*`,
        `— but you *cannot settle* that principal ever! 💀`
    ].join(" ");
    if (v(CONTRACT_RUN) > v("10a")) {
        return message + "\n\n" + [
            `In exchange, you will pay interest at the base rate only`,
            `— instead of the higher borrow rate (i.e. the protocol's`,
            `spread of ±${await spread(ctx, (t) => ctx.pool.borrowOf(t))} is waived). ✨`
        ].join(" ");
    }
    return message;
}
async function spread(
    { pool, token }: Pick<TxContext, "pool" | "token">,
    positionOf: (target: Address) => Promise<Address>,
) {
    const position = new PositionContract(
        await positionOf(token.target), pool.runner,
    );
    const [, s] = await position.model();
    const spread_pct = NUM_FORMAT(1)(Number(s) / UNIT * 100);
    return `${spread_pct}%`;
}
async function supply_fee({ vault }: Pick<TxContext, "vault">) {
    const { entry: fee } = await vault.fee();
    const fee_pml = VaultFee.permille(fee);
    return `${NUM_FORMAT(1)(fee_pml)}‰`;
}
async function borrow_fee({ vault }: Pick<TxContext, "vault">) {
    const { exit: fee } = await vault.fee();
    const fee_pct = VaultFee.percent(fee);
    return `${NUM_FORMAT(1)(fee_pct)}%`;
}
const zero_error = () => {
    return `invalid amount; enter a number larger than 0.`;
}
const call_error = (
    t: Token, e: CallExceptionError
) => {
    const fallback = dot(cap(e.reason ?? e.shortMessage));
    console.error(e);
    if (e.data) {
        const iface = new Interface(POSITION_ABI);
        const error = iface.parseError(e.data);
        if (error) {
            console.error(error);
        }
        if (error?.name === "AbsoluteCapExceeded") {
            const kmg = KMG_FORMAT(3)(Token.amount(t, error.args[0]));
            return `beyond *absolute* position cap of ${kmg}; try to reduce the amount.`;
        }
        if (error?.name === "RelativeCapExceeded") {
            const kmg = KMG_FORMAT(3)(Token.amount(t, error.args[0]));
            return `beyond *relative* position cap of ${kmg}; try to reduce the amount.`;
        }
    }
    if (e.data) {
        const iface = new Interface(POOL_ABI);
        const error = iface.parseError(e.data);
        if (error) {
            console.error(error);
        }
        if (error?.name === "PowLimited") {
            return `You have been rate-limited; try again (later).`;
        }
        if (error?.name === "RateLimited" || error?.name === "CapLimited") {
            const dt = humanize(Number(error.args[1]));
            return `You have been rate-limited; try again in ${dt}.`;
        }
    }
    return fallback;
}
export default TxRunner;
