import "reflect-metadata"
import type { DecoratorMetadata } from "@/types";

import { STATE_META_KEY } from "@/common";

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

export const State = <T>(initialValue: T, options?: StateOptions): PropertyDecorator => (target, propertyKey) => {
    const states: DecoratorMetadata<IState>[] = Reflect.getMetadata(STATE_META_KEY, target) || [];
    states.push({key: String(propertyKey), value: {initialValue, options}});
    Reflect.defineMetadata(STATE_META_KEY, states, target);
}

