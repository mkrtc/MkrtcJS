import "reflect-metadata"
import type { DecoratorMetadata } from "@/types/index.js";

import { STATE_META_KEY } from "@/common/index.js";

export interface StateOptions{
    isTimer?: boolean;
    timerOptions?: {
        delay?: number;
    }
}

export interface IState {
    initialValue: any;
    options?: StateOptions;
}

export const State = <T>(initialValue?: T, options?: StateOptions): PropertyDecorator => (target, propertyKey) => {
    const states: DecoratorMetadata<IState>[] = Reflect.getMetadata(STATE_META_KEY, target) || [];
    const initValue = typeof initialValue === "undefined" ? null : initialValue; 
    states.push({key: String(propertyKey), value: {initialValue: initValue, options}});
    Reflect.defineMetadata(STATE_META_KEY, states, target);
}

