import "reflect-metadata";
import type { DecoratorMetadata } from "@/types";
import type { IService } from "@/decorators/client";

import { STATE_META_KEY } from "@/common";

export function initState(this: any) {
    const states: DecoratorMetadata[] = Reflect.getMetadata(STATE_META_KEY, this) ?? [];
    for (const { key } of states) {
        Object.defineProperty(this, key, {
            get(this: IService) {
                return this.__state[key];
            },
            set(this: IService, value: any) {
                this.__setState(key, value);
            },
            enumerable: true,
            configurable: true
        })
    }
}