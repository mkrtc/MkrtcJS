import "reflect-metadata";
import type { DecoratorMetadata } from "@/types";

import { AbstractService, STATE_META_KEY } from "@/common";

export function initState(this: any) {
    const states: DecoratorMetadata[] = Reflect.getMetadata(STATE_META_KEY, this) ?? [];
    for (const { key } of states) {
        Object.defineProperty(this, key, {
            get(this: AbstractService) {
                return this['_state'][key];
            },
            set(this: AbstractService, value: any) {
                this['setState'](key, value);
            },
            enumerable: true,
            configurable: true
        })
    }
}