type ImportOriginal = () => Promise<Record<string, unknown>>;

export async function mockFunction(
    importOriginal: ImportOriginal,
    overrides?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    return { ...await importOriginal(), polyfill: () => {}, ...overrides };
}
