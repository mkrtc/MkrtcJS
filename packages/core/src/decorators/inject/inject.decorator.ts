import "reflect-metadata";
import type { DecoratorMetadata } from "@/types";

import { InjectableDiContainer } from "@/di"
import { INJECT_META_KEY } from "@/common";

export function Inject(): PropertyDecorator {
    return function (target, propertyKey: string | symbol) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        if (!InjectableDiContainer.has(type)) {
            InjectableDiContainer.set(type, new type());
        }

        const injects: DecoratorMetadata[] = Reflect.getMetadata(INJECT_META_KEY, target) ?? [];
        injects.push({ key: String(propertyKey), value: InjectableDiContainer.get(type) });
        Reflect.defineMetadata(INJECT_META_KEY, injects, target);
    };
}