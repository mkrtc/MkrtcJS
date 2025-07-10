import "reflect-metadata";
import type { DecoratorMetadata } from "@/types/index.js";

import { ON_INIT_META_KEY } from "@/common/index.js";


export const OnInit = (): MethodDecorator => (target, propertyKey) => {
    const methods: DecoratorMetadata[] = Reflect.getMetadata(ON_INIT_META_KEY, target) ?? [];
    methods.push({key: String(propertyKey), value: true});
    Reflect.defineMetadata(ON_INIT_META_KEY, methods, target);
}