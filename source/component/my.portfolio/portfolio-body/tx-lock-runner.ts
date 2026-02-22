import { WalletProvider } from "@/blockchain";
import { CONTRACT_RUN, UNIT } from "@/constant";
import { ERC20Contract, PoolContract, PositionContract } from "@/contract";
import { assert, cap, dot, KMG_FORMAT, NUM_FORMAT, NUMEXP_FORMAT, Parser, v, addressOf as x } from "@/function";
import { Account, Address, Amount, Mode, Pool, Position } from "@/type";
import { CallExceptionError, Interface, isCallException } from "ethers";

import POOL_ABI from "@/contract/pool-abi.json";
import POSITION_ABI from "@/contract/position-abi.json";

type TxLockContext = {
    address: Address;
    pool: PoolContract;
    position: PositionContract;
    token: ERC20Contract;
}
type TxLockData = {
    position: Position;
}
export async function TxLockRunner(
    account: Account | null,
    pool_address: Pool,
    mode: Mode,
    data: TxLockData,
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
        x(data.position.address), signer,
    );
    if (mode === Mode.supply) {
        const supply_address = await pool.supplyOf(token.target);
        const position = new PositionContract(supply_address, signer);
        return lock_supply({ address, pool, position, token }, data);
    }
    if (mode === Mode.borrow) {
        const borrow_address = await pool.borrowOf(token.target);
        const position = new PositionContract(borrow_address, signer);
        return lock_borrow({ address, pool, position, token }, data);
    }
}
async function lock_supply(
    ctx: TxLockContext, data: TxLockData,
) {
    const { address, pool, position } = ctx;
    const p = data.position;
    //
    // Fetch account balance (of position):
    //
    const [total_big, locked_big] = await Promise.all([
        position.totalOf(address),
        position.lockOf(address),
    ]);
    const total_num = Position.amount(p, total_big);
    const locked_num = Position.amount(p, locked_big);
    const liquid_num = Position.amount(p, total_big - locked_big);
    //
    // Prompt for lock amount:
    //
    const label = Mode.modal(Mode.supply);
    const locked_kmg = KMG_FORMAT(3)(locked_num);
    const total_kmg = KMG_FORMAT(3)(total_num);
    const amount_txt = `${prompt(
        `Lock ${label.toLowerCase()} ${p.symbol} (${locked_kmg} of ${total_kmg} locked): 🔒`,
        NUMEXP_FORMAT(liquid_num),
    )}`;
    if (amount_txt === "null") return; // cancel
    const amount_num = Parser.number(amount_txt, 0);
    if (!amount_num) return alert(lock_zero(p));
    //
    // Confirm irreversibility:
    //
    if (!confirm(await lock_supply_msg(ctx, p, amount_num))) {
        return;
    }
    //
    // Try to lock supply:
    //
    const amount_big = Position.big(p, amount_num);
    try {
        const tx = await pool.lockSupply(
            p.address, amount_big
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(lock_error(p, e));
        }
        throw e;
    }
}
async function lock_borrow(
    ctx: TxLockContext, data: TxLockData,
) {
    const { address, pool, position } = ctx;
    const p = data.position;
    //
    // Fetch account balance (of position):
    //
    const [total_big, locked_big] = await Promise.all([
        position.totalOf(address),
        position.lockOf(address),
    ]);
    const total_num = Position.amount(p, total_big);
    const locked_num = Position.amount(p, locked_big);
    const liquid_num = Position.amount(p, total_big - locked_big);
    //
    // Prompt for lock amount:
    //
    const label = Mode.modal(Mode.borrow);
    const locked_kmg = KMG_FORMAT(3)(locked_num);
    const total_kmg = KMG_FORMAT(3)(total_num);
    const amount_txt = `${prompt(
        `Lock ${label.toLowerCase()} ${p.symbol} (${locked_kmg} of ${total_kmg} locked): 🔒`,
        NUMEXP_FORMAT(liquid_num),
    )}`;
    if (amount_txt === "null") return; // cancel
    const amount_num = Parser.number(amount_txt, 0);
    if (!amount_num) return alert(lock_zero(p));
    //
    // Confirm irreversibility:
    //
    if (!confirm(await lock_borrow_msg(ctx, p, amount_num))) {
        return;
    }
    //
    // Try to lock borrow:
    //
    const amount_big = Position.big(p, amount_num);
    try {
        const tx = await pool.lockBorrow(
            p.address, amount_big
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(lock_error(p, e));
        }
        throw e;
    }
}
async function lock_supply_msg(
    ctx: TxLockContext, p: Position, amount: Amount,
) {
    const amount_kmg = KMG_FORMAT(3)(amount);
    const message = [
        `You are about to *lock* ${amount_kmg} ${p.symbol}`,
        `— but you *cannot redeem* that principal ever! 💀`
    ].join(" ");
    if (v(CONTRACT_RUN) > v("10a")) {
        return message + "\n\n" + [
            `In exchange, you will earn interest at the full base rate`,
            `— instead of the reduced supply rate (i.e. the protocol's`,
            `spread of ±${await lock_spread(ctx, (t) => ctx.pool.supplyOf(t))} is waived). ✨`
        ].join(" ");
    }
    return message;
}
async function lock_borrow_msg(
    ctx: TxLockContext, p: Position, amount: Amount,
) {
    const amount_kmg = KMG_FORMAT(3)(amount);
    const message = [
        `You are about to *lock* ${amount_kmg} ${p.symbol}`,
        `— but you *cannot settle* that principal ever! 💀`
    ].join(" ");
    if (v(CONTRACT_RUN) > v("10a")) {
        return message + "\n\n" + [
            `In exchange, you will pay interest at the base rate only`,
            `— instead of the higher borrow rate (i.e. the protocol's`,
            `spread of ±${await lock_spread(ctx, (t) => ctx.pool.borrowOf(t))} is waived). ✨`
        ].join(" ");
    }
    return message;
}
async function lock_spread(
    { pool, token }: Pick<TxLockContext, "pool" | "token">,
    positionOf: (target: Address) => Promise<Address>,
) {
    const position = new PositionContract(
        await positionOf(token.target), pool.runner,
    );
    const [, s] = await position.model();
    const spread_pct = NUM_FORMAT(1)(Number(s) / UNIT * 100);
    return `${spread_pct}%`;
}
function lock_zero(p: Position) {
    return `Lock ${p.symbol}: invalid amount; enter a number larger than 0.`;
}
function lock_error(
    p: Position, e: CallExceptionError,
) {
    const fallback = dot(cap(e.reason ?? e.shortMessage));
    console.error(e);
    if (e.data) {
        const iface = new Interface(POOL_ABI);
        const error = iface.parseError(e.data);
        if (error) {
            console.error(error);
        }
        if (error?.name === "PowLimited") {
            return `Lock ${p.symbol}: You have been rate-limited; try again (later).`;
        }
    }
    if (e.data) {
        const iface = new Interface(POSITION_ABI);
        const error = iface.parseError(e.data);
        if (error) {
            console.error(error);
        }
    }
    return `Lock ${p.symbol}: ${fallback}`;
}
export default TxLockRunner;
