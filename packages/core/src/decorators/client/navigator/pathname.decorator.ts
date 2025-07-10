import "reflect-metadata";
import { PATHNAME_PARAM_META_KEY } from "@/common/index.js";
import { DecoratorMetadata } from "@/types/index.js";

export const Pathname = (): ParameterDecorator => (target, propertyKey, index) => {
    const key = `${PATHNAME_PARAM_META_KEY}::${propertyKey?.toString()}`;
    const params: DecoratorMetadata<number>[] = Reflect.getMetadata(key, target) || [];
    params.push({key: propertyKey?.toString() || "", value: index})
    Reflect.defineMetadata(key, params, target);
}