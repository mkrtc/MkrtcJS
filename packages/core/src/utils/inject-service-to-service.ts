import "reflect-metadata";
import { INJECT_SERVICE_META_KEY } from "@/common/index.js";
import { DecoratorMetadata } from "@/types/index.js";
import type { IService } from "@/decorators/client/index.js";

export function injectServiceToService(this: any) {
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