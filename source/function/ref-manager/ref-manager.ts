export class RefManager<
    Obj extends Record<string, unknown>,
    Ref extends Obj = Obj
> {
    /**
     * Creates a new reference manager with the given
     * key derivator function (for a provided object).
     *
     * @param keyOf function to derive the object's key
     * @returns a new reference manager
     */
    constructor(keyOf: (composite_obj: Obj) => string) {
        this.keyOf = keyOf;
    }
    /**
     * Returns the reference associated with the object, or
     * creates a new one if the object's key is not present.
     *
     * @param composite_obj to search the associated reference for
     * @param factory to optionaly create a new reference with
     * @returns the associated object reference
     */
    get(composite_obj: Obj, factory?: () => Ref): Ref {
        const key = this.keyOf(composite_obj);
        if (!key) {
            throw new Error("invalid key");
        }
        const ref_value = this.map.get(key);
        if (ref_value !== undefined) {
            return ref_value;
        }
        const ref = factory?.() ?? composite_obj as Ref;
        this.map.set(key, ref);
        return ref;
    }
    /**
     * Checks if the manager has a reference associated
     * with the given object's key.
     *
     * @param composite_obj to check the object-key for
     * @returns whether the object-key is present
     */
    has(composite_obj: Obj): boolean {
        return this.map.has(this.keyOf(composite_obj));
    }
    private readonly map = new Map<string, Ref>();
    private readonly keyOf: (key: Obj) => string;
}
