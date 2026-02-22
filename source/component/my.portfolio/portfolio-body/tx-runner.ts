import { WalletProvider } from "@/blockchain";
import { ERC20Contract, PoolContract, PositionContract, VaultContract } from "@/contract";
import { assert, bimin, cap, dot, KMG_FORMAT, NUM_FORMAT, NUMEXP_FORMAT, Parser, addressOf as x } from "@/function";
import { Account, Address, Amount, Mode, Pool, Position, VaultFee } from "@/type";
import { CallExceptionError, Interface, isCallException, MaxUint256 } from "ethers";

import POSITION_ABI from "@/contract/position-abi.json";
import VAULT_ABI from "@/contract/vault-abi.json";

type TxContext = {
    address: Address;
    pool: PoolContract;
    position: PositionContract;
    token: ERC20Contract;
    vault: VaultContract;
}
type TxData = {
    amount: Amount | null;
    position: Position;
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
        x(data.position.address), signer,
    );
    const vault = new VaultContract(
        await pool.vaultOf(token.target), signer
    );
    if (mode === Mode.supply) {
        const supply_address = await pool.supplyOf(token.target);
        const position = new PositionContract(supply_address, signer);
        return redeem({ address, pool, position, token, vault }, data);
    }
    if (mode === Mode.borrow) {
        const borrow_address = await pool.borrowOf(token.target);
        const position = new PositionContract(borrow_address, signer);
        return settle({ address, pool, position, token, vault }, data);
    }
}
async function redeem(
    ctx: TxContext, data: TxData,
) {
    const { address, pool, vault, position } = ctx;
    const { amount, position: p } = data;
    //
    // Fetch account balance (of position):
    //
    const [total_big, locked_big] = await Promise.all([
        position.totalOf(address),
        position.lockOf(address),
    ]);
    const liquid_num = Position.amount(
        p, total_big - locked_big
    );
    //
    // Check if amount is valid:
    //
    const fee_txt = await redeem_fee(ctx);
    const amount_txt = `${amount ?? prompt(
        `Redeem ${p.symbol} (excl. a fee of ${fee_txt}):`,
        NUMEXP_FORMAT(liquid_num),
    )}`;
    if (amount_txt === "null") return; // cancel
    const amount_num = Parser.number(amount_txt, 0);
    if (!amount_num) return alert(redeem_zero(p));
    //
    // Try to redeem amount:
    //
    const amount_big = Position.big(p, amount_num);
    try {
        const tx = await pool.redeem(
            p.address, amount_big
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(await redeem_error(p, e, { vault }));
        }
        throw e;
    }
}
async function settle(
    ctx: TxContext, data: TxData,
) {
    const { address, pool, position, token, vault } = ctx;
    const { amount, position: p, ctrl } = data;
    //
    // Fetch account balance (of token):
    //
    const [total_big, locked_big, balance_big] = await Promise.all([
        position.totalOf(address),
        position.lockOf(address),
        token.balanceOf(address),
    ]);
    const balance_num = Position.amount(
        p, bimin(balance_big, total_big - locked_big),
    );
    //
    // Check if amount is valid:
    //
    const amount_min = Math.min(
        Position.amount(p),
        balance_num,
    )
    const fee_txt = await settle_fee(ctx);
    const amount_txt = `${amount ?? prompt(
        `Settle ${p.symbol} (excl. a fee of ${fee_txt}):`,
        NUMEXP_FORMAT(amount_min),
    )}`;
    if (amount_txt === "null") return; // cancel
    const amount_num = Parser.number(amount_txt, 0);
    if (!amount_num) return alert(settle_zero(p));
    //
    // Check if allowance is enough:
    //
    const allowance_big = await token.allowance(
        address, pool.target,
    );
    const allowance_max = !ctrl
        ? Position.big(p, amount_num)
        : MaxUint256;
    if (allowance_big < allowance_max) try {
        const tx = await token.approve(
            pool.target, allowance_max
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(await settle_error(p, e, { vault }));
        }
        throw e;
    }
    //
    // Try to settle amount:
    //
    const amount_big = Position.big(p, amount_num);
    try {
        const tx = await pool.settle(
            p.address, amount_big
        );
        await tx.wait(1); // for confirmation
    } catch (e) {
        if (isCallException(e)) {
            return alert(await settle_error(p, e, { vault }));
        }
        throw e;
    }
}
async function redeem_fee({ vault }: TxContext) {
    const { exit: fee } = await vault.fee();
    const fee_pct = VaultFee.percent(fee);
    return `${NUM_FORMAT(1)(fee_pct)}%`;
}
async function settle_fee({ vault }: TxContext) {
    const { entry: fee } = await vault.fee();
    const fee_pml = VaultFee.permille(fee);
    return `${NUM_FORMAT(1)(fee_pml)}‰`;
}
function redeem_zero(p: Position) {
    return `Redeem ${p.symbol}: ${zero_error(p)}`;
}
function settle_zero(p: Position) {
    return `Settle ${p.symbol}: ${zero_error(p)}`;
}
async function redeem_error(
    p: Position, e: CallExceptionError, ctx: Pick<TxContext, "vault">
) {
    return `Redeem ${p.symbol}: ${await call_error(p, e, ctx)}`;
}
async function settle_error(
    p: Position, e: CallExceptionError, ctx: Pick<TxContext, "vault">
) {
    return `Settle ${p.symbol}: ${await call_error(p, e, ctx)}`;
}
const zero_error = (_: Position) => {
    return `invalid amount; enter a number larger than 0.`;
}
const call_error = async (
    p: Position, e: CallExceptionError, { vault: v }: Pick<TxContext, "vault">
) => {
    const fallback = dot(cap(e.reason ?? e.shortMessage));
    console.error(e);
    if (e.data) {
        const iface = new Interface(POSITION_ABI);
        const error = iface.parseError(e.data);
        if (error) {
            console.error(error);
        }
        if (error?.name === "Locked") try {
            const kmg = KMG_FORMAT(3)(Position.amount(p, error.args[1]));
            return `exceeded *locked* balance of ${kmg}; try to reduce the amount.`;
        } catch (_) {
            return `exceeded *locked* balance; try to reduce the amount.`;
        }
    }
    if (e.data) {
        const iface = new Interface(VAULT_ABI);
        const error = iface.parseError(e.data);
        if (error) {
            console.error(error);
        }
        if (error?.name === "ERC4626ExceededMaxRedeem") try {
            const assets = await v.convertToAssets(error.args[2]);
            const kmg = KMG_FORMAT(3)(Position.amount(p, assets));
            return `exceeded max. redeem of ${kmg}; try to reduce the amount.`;
        } catch (_) {
            return `exceeded max. redeem; try to reduce the amount.`;
        }
        if (error?.name === "ERC20InsufficientBalance") try {
            const assets = await v.convertToAssets(error.args[2]);
            const kmg = KMG_FORMAT(3)(Position.amount(p, assets));
            return `exceeded balance of ${kmg}; try to reduce the amount.`;
        } catch (_) {
            return `exceeded balance; try to reduce the amount.`;
        }
    }
    return fallback;
}
export default TxRunner;
