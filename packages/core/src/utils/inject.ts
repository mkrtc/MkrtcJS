import "reflect-metadata";
import type { DecoratorMetadata } from "@/types";
import { INJECT_META_KEY } from "@/common";


export function inject(this: any){
    const inject: DecoratorMetadata[] = Reflect.getMetadata(INJECT_META_KEY, this) ?? [];
    for (const { key, value } of inject) {
        Object.defineProperty(this, key, {
            get() {
                return value;
            },
            enumerable: true,
            configurable: true
        })
    }
}