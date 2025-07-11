import { ON_PATH_CHANGE_META_KEY } from "@/common/index.js";
import { DecoratorMetadata } from "@/types/index.js";
import "reflect-metadata";

export const OnPathChange = (): MethodDecorator => (target, propertyKey, descriptor: PropertyDescriptor) => {
    const method: Function = descriptor.value;
    const metadata: DecoratorMetadata<Function>[] = Reflect.getMetadata(ON_PATH_CHANGE_META_KEY, target) || [];
    metadata.push({ key: propertyKey.toString(), value: method });
    Reflect.defineMetadata(ON_PATH_CHANGE_META_KEY, metadata, target);
}