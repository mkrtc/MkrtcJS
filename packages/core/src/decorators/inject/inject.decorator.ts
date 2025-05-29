import "reflect-metadata";
import type { DecoratorMetadata } from "@/types";

import { INJECT_META_KEY } from "@/common";
import { ClientDIContainer } from "@/di";

export function Inject(): PropertyDecorator {
    return function (target, propertyKey: string | symbol) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        const injectableDiContainer = ClientDIContainer.get("injectable");
        if (!injectableDiContainer.has(type)) {
            injectableDiContainer.set(type, new type());
        }
        const injects: DecoratorMetadata[] = Reflect.getMetadata(INJECT_META_KEY, target) ?? [];
        injects.push({ key: String(propertyKey), value: injectableDiContainer.get(type) });
        Reflect.defineMetadata(INJECT_META_KEY, injects, target);
    };
}