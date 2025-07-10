import { ON_DESTROY_KEY } from "@/common/index.js";
import { DecoratorMetadata } from "@/types/index.js";
import "reflect-metadata";



export const OnDestroy = (): MethodDecorator => (target, propertyKey, descriptor) => {
    const method = descriptor.value;
    if(typeof method !== 'function') throw new Error(`Method ${propertyKey.toString()} is not a function`);
    const methods: DecoratorMetadata[] = Reflect.getMetadata(ON_DESTROY_KEY, target) ?? [];
    methods.push({
        key: propertyKey.toString(),
        value: method
    });

    Reflect.defineMetadata(ON_DESTROY_KEY, methods, target);
}