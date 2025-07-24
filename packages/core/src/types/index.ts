export type * from "./decorators/index.js";
export type * from "./hooks/index.js";
export type * from "./server/index.js";

export type ClassType<C> = new (...args: any[]) => C;