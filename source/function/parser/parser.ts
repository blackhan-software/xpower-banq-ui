export class Parser {
    static boolean<F>(
        text: string | undefined | null, fallback: F
    ): boolean | F {
        try {
            return Boolean(JSON.parse(text || `${fallback}`));
        } catch {
            return fallback;
        }
    }
    static number<F>(
        text: string | undefined | null, fallback: F
    ): number | F {
        if (typeof text === "string") {
            text = text.replace(/_|,/g, "");
            text = text.replace(/^0+/, "0");
        }
        try {
            const parsed = Number(text || `${fallback}`);
            return typeof parsed === "number" ? parsed : fallback;
        } catch {
            return fallback;
        }
    }
    static bigint<F>(
        text: string | undefined | null, fallback: F
    ): bigint | F {
        if (typeof text === "string") {
            text = text.replace(/_|,|n$/g, "");
            text = text.replace(/^0+/, "0");
        }
        try {
            const parsed = BigInt(text || `${fallback}`);
            return typeof parsed === "bigint" ? parsed : fallback;
        } catch {
            return fallback;
        }
    }
    static string<F>(
        text: string | undefined | null, fallback: F
    ): string | F {
        try {
            const parsed = String(text || `${fallback}`);
            return typeof parsed === "string" ? parsed : fallback;
        } catch {
            return fallback;
        }
    }
    static object<F>(
        text: string | undefined | null, fallback: F
    ): object | F {
        try {
            const parsed = JSON.parse(text || `${fallback}`);
            return typeof parsed === "object" ? parsed : fallback;
        } catch {
            return fallback;
        }
    }
}
export default Parser;
