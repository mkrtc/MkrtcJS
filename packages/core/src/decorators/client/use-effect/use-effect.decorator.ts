import "reflect-metadata";
import { DecoratorMetadata } from "@/types";
import { USE_EFFECT_META_KEY } from "@/common";

type Key<S extends object> = keyof S;

export const UseEffect = <S extends object>(key: "*" | Key<S> | Key<S>[]): MethodDecorator => (target, propertyKey, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    if(typeof method !== 'function') throw new Error(`Method ${propertyKey.toString()} is not a function`);
    const effects: DecoratorMetadata[] = Reflect.getMetadata(USE_EFFECT_META_KEY, target) ?? [];
    if(Array.isArray(key)){
        effects.push(...key.map(key => ({key: String(key), value: method})));
    }else{
        effects.push({key: String(key), value: method});
    }
    Reflect.defineMetadata(USE_EFFECT_META_KEY, effects, target);
}