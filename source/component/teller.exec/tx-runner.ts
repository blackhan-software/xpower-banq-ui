import { WalletProvider } from "@/blockchain";
import { ERC20Contract, PoolContract, VaultContract } from "@/contract";
import { assert, cap, dot, KMG_FORMAT, NUM_FORMAT, NUMEXP_FORMAT, Parser, addressOf as x } from "@/function";
import { Account, Address, Amount, Mode, Pool, Token, VaultFee } from "@/type";
import { CallExceptionError, Interface, isCallException, MaxUint256 } from "ethers";
import moment from "moment";

import POOL_ABI from "@/contract/pool-abi.json";
import POSITION_ABI from "@/contract/position-abi.json";

type TxContext = {
    address: Address;
    pool: PoolContract;
    token: ERC20Contract;
    vault: VaultContract;
}
type TxData = {
    amount: Amount | null;
    token: Token;
    ctrl: boolean;
}
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
        pool.vaultOf(token.target), signer
    );
    if (mode === Mode.supply) {
        return supply({ address, pool, token, vault }, data);
    }
    if (mode === Mode.borrow) {
        return borrow({ address, pool, token, vault }, data);
    }
}
async function supply(
    ctx: TxContext, data: TxData,
) {
    const { address, pool, token } = ctx;
    const { amount, token: t, ctrl } = data;
    //
    // Check if amount is valid:
    //
    if (!amount) {
        return alert(supply_zero(t));
    }
    const fee_txt = await supply_fee(ctx);
    const amount_txt = `${prompt(
        `Supply ${t.symbol} (excl. a fee of ${fee_txt}):`,
        NUMEXP_FORMAT(amount),
    )}`;
    if (amount_txt === "null") {
        return; // cancel
    }
    const amount_num = Parser.number(
        amount_txt.replace("!", ""), 0,
    );
    if (!amount_num) {
        return alert(supply_zero(t));
    }
    //
    // Check if allowance is enough:
    //
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
    //
    // Check if lock is requested:
    //
    const lock = amount_txt.endsWith("!");
    if (lock && !confirm(supply_lock(t, amount_num))) {
        return;
    }
    //
    // Try to supply amount:
    //
    const amount_big = Token.big(t, amount_num);
    try {
        const tx = await pool.supply(
            t.address, amount_big, lock, { address },
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(supply_error(t, e));
        }
        throw e;
    }
}
async function borrow(
    ctx: TxContext, data: TxData,
) {
    const { address, pool } = ctx;
    const { amount, token: t } = data;
    //
    // Check if amount is valid:
    //
    if (!amount) {
        return alert(borrow_zero(t));
    }
    const fee_txt = await borrow_fee(ctx);
    const amount_txt = `${prompt(
        `Borrow ${t.symbol} (excl. a fee of ${fee_txt}):`,
        NUMEXP_FORMAT(amount),
    )}`;
    if (amount_txt === "null") {
        return; // cancel
    }
    const amount_num = Parser.number(
        amount_txt.replace("!", ""), 0,
    );
    if (!amount_num) {
        return alert(borrow_zero(t));
    }
    //
    // Check if lock is requested:
    //
    const lock = amount_txt.endsWith("!");
    if (lock && !confirm(borrow_lock(t, amount_num))) {
        return;
    }
    //
    // Try to borrow amount:
    //
    const amount_big = Token.big(t, amount_num);
    try {
        const tx = await pool.borrow(
            t.address, amount_big, lock, { address },
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(borrow_error(t, e));
        }
        throw e;
    }
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
function supply_lock(t: Token, amount: Amount) {
    const amount_kmg = KMG_FORMAT(3)(amount);
    return [
        `You are about to supply ${amount_kmg} ${t.symbol} with a *lock*`,
        `— this means you cannot redeem it *ever*! Do you understand? 💀`
    ].join(" ");
}
function borrow_lock(t: Token, amount: Amount) {
    const amount_kmg = KMG_FORMAT(3)(amount);
    return [
        `You are about to borrow ${amount_kmg} ${t.symbol} with a *lock*`,
        `— this means you cannot settle it *ever*! Do you understand? 💀`
    ].join(" ");
}
function supply_zero(t: Token) {
    return `Supply ${t.symbol}: ${zero_error(t)}`;
}
function borrow_zero(t: Token) {
    return `Borrow ${t.symbol}: ${zero_error(t)}`;
}
function supply_error(t: Token, e: CallExceptionError) {
    return `Supply ${t.symbol}: ${call_error(t, e)}`;
}
function borrow_error(t: Token, e: CallExceptionError) {
    return `Borrow ${t.symbol}: ${call_error(t, e)}`;
}
const zero_error = (_: Token) => {
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
            return `beyond *absolute* cap-limit of ${kmg}; try to reduce the amount.`;
        }
        if (error?.name === "RelativeCapExceeded") {
            const kmg = KMG_FORMAT(3)(Token.amount(t, error.args[0]));
            return `beyond *relative* cap-limit of ${kmg}; try to reduce the amount.`;
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
            const dt = moment.duration(Number(error.args[1]), 'seconds');
            return `You have been rate-limited; try again in ${dt.humanize()}.`;
        }
    }
    return fallback;
}
export default TxRunner;
