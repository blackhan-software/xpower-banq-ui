export type OmitKeys<T, Prefix extends string> = keyof {
    [K in keyof T as K extends `${Prefix}${string}` ? never : K]: T[K];
};
export type PickKeys<T, Prefix extends string> = keyof {
    [K in keyof T as K extends `${Prefix}${string}` ? K : never]: T[K];
};

export * from "./account";
export * from "./address";
export * from "./addressable";
export * from "./health";
export * from "./limit";
export * from "./logger";
export * from "./mode";
export * from "./modifiers";
export * from "./nullable";
export * from "./pool";
export * from "./pool-account";
export * from "./pool-list";
export * from "./pool-token";
export * from "./position";
export * from "./quote";
export * from "./rate-info";
export * from "./rate-model";
export * from "./symbol";
export * from "./token";
export * from "./tokens";
export * from "./util";
export * from "./vault-fee";
export * from "./weight";

export type Seconds = number;
export type Amount = number;
export type Percent = number;
export type Rate = number;
export type Total = bigint;
