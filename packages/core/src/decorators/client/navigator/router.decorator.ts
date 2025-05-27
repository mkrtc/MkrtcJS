import { ROUTER_PARAM_META_KEY } from "@/common";
import { DecoratorMetadata } from "@/types";
import "reflect-metadata";

export const Router = (): ParameterDecorator => (target, propertyKey, index) => {
    const key = `${ROUTER_PARAM_META_KEY}::${propertyKey?.toString()}`;
    const params: DecoratorMetadata<number>[] = Reflect.getMetadata(key, target) || [];
    params.push({ key: propertyKey?.toString() || "", value: index })
    Reflect.defineMetadata(key, params, target);
} 