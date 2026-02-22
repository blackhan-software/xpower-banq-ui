import { StateCreator } from "zustand";
import { PersistOptions, persist } from "zustand/middleware";
import { SessionStorage } from "./session-storage";
import { sessionVersion } from "./session-version";

// deno-lint-ignore no-explicit-any
export type Session<T> = StateCreator<T, [], any>
export type SessionCreator<T> = StateCreator<T>
export type SessionOptions<T> = Omit<
    PersistOptions<T, Partial<T>>, "name"
> & {
    name?: string;
}
/**
 * A zustand persistency middleware with a session-storage
 * backend (using JSON). By default, the session resets on
 * each new day -- in case of long-lived browser sessions.
 *
 * @return A zustand persistency middleware.
 */
export function withSession<T>(
    creator: SessionCreator<T>,
    options?: SessionOptions<T>,
): Session<T> {
    return persist(creator, {
        name: "application-storage",
        // use session-storage backend
        storage: SessionStorage<T>(),
        // reset session on version mismatch
        migrate: () => ({} as Partial<T>),
        // set version to session-version
        version: sessionVersion(),
        // extend with further options
        ...options
    });
}
export default withSession;
