import "reflect-metadata";
import { AbstractService, INJECT_META_KEY } from "@/common";
import type { DecoratorMetadata } from "@/types";


export function inject(this: any){
    const inject: DecoratorMetadata[] = Reflect.getMetadata(INJECT_META_KEY, this) ?? [];
    for (const { key, value } of inject) {
        Object.defineProperty(this, key, {
            get(this: AbstractService) {
                return value;
            },
            enumerable: true,
            configurable: true
        })
    }
}