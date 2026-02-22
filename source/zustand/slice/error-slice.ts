import { SliceCreator } from "../app-store";

export interface ErrorSlice {
    errors: Map<string, Error>;
    set_error: (name: string, error: Error | null) => void;
}

export const createErrorSlice: SliceCreator<ErrorSlice> = (set) => ({
    set_error: (name, error) => set((s) => {
        const next = new Map(s.errors);
        if (error) {
            next.set(name, error);
        } else {
            next.delete(name);
        }
        return { errors: next };
    }, {
        type: "SET_ERROR", path: []
    }),
    errors: new Map(),
});
