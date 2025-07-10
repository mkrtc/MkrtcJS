import { INJECT_SERVICE_META_KEY } from "@/common";
import { DecoratorMetadata } from "@/types";
import type { IService } from "@/decorators/client";

export function injectServiceToService(this: any){
    const services: DecoratorMetadata[] = Reflect.getMetadata(INJECT_SERVICE_META_KEY, this) ?? [];
        for (const { key, value } of services) {
            Object.defineProperty(this, key, {
                get(this: IService) {
                    return value;
                },
                enumerable: true,
                configurable: true
            })
        }
}