import "reflect-metadata";
import { ON_DESTROY_KEY, STATE_META_KEY, USE_EFFECT_META_KEY, WATCH_META_KEY } from "@/common"
import { initState, inject, onInit } from "@/utils";
import { DecoratorMetadata } from "@/types";
import { IState } from "..";

export interface IService<S extends Record<string, any> = Record<string, any>> {
    __isGlobal: boolean;
    __isService: boolean;
    __listeners: Partial<Record<keyof S, Set<Listener>>>;
    __state: S;
    __subscribeToKey<K extends keyof S>(key: K, cb: Listener): () => boolean;
    __destroy(): void;
    __setState<K extends keyof Record<string, any>>(key: K, value: Record<string, any>[K]): void;
    __createReactiveState(state: S): S
}

type Listener = () => void;

interface ServiceOptions {
    isGlobal?: boolean;
}

export const Service = <S extends Record<string, any> = Record<string, any>>(options?: ServiceOptions) => <T extends { new(...args: any[]): object }>(target: T) => {
    const service = class extends target implements IService<S> {
        public __isGlobal: boolean;
        public __isService: boolean = true;
        public __listeners: Partial<Record<keyof S, Set<Listener>>> = {};
        public __state: S;

        constructor(...args: any[]) {
            super(...args);
            this.__isGlobal = options?.isGlobal || false;

            initState.call(this);
            inject.call(this);
            onInit.call(this);
            const keys: DecoratorMetadata<IState>[] = Reflect.getMetadata(STATE_META_KEY, this);
            const value: S = keys.reduce<any>((prev, { key, value }) => {
                prev[key] = value.initialValue;
                return prev;
            }, {});

            this.__state = this.__createReactiveState(value);
        }

        public __subscribeToKey<K extends keyof S>(key: K, cb: Listener): () => boolean {
            if (!this.__listeners[key]) {
                this.__listeners[key] = new Set();
            }
            this.__listeners[key]!.add(cb);
            return () => this.__listeners[key]!.delete(cb);
        }

        public __destroy() {
            const methods: DecoratorMetadata<Function>[] = Reflect.getMetadata(ON_DESTROY_KEY, this) ?? [];
            for (const { value } of methods) {
                value.apply(this);
            }
        }

        public __setState<K extends keyof Record<string, any>>(key: K, value: Record<string, any>[K]) {
            const prevValue = this.__state[key];
            this.__state[key] = value;
            const effects: DecoratorMetadata<Function>[] = Reflect.getMetadata(USE_EFFECT_META_KEY, this) ?? [];
            const watch: DecoratorMetadata<Function>[] = Reflect.getMetadata(WATCH_META_KEY, this) ?? [];

            for (const { key: wchKey, value: wchMethod } of watch) {
                if (wchKey === "*" || wchKey === key) {
                    wchMethod.apply(this, [key, prevValue, value]);
                }
            }

            for (const { key: effectKey, value: method } of effects) {
                if ((effectKey === "*" || key === effectKey) && JSON.stringify(prevValue) !== JSON.stringify(value)) {
                    method.apply(this, [key, prevValue, value]);
                }
            }
        }

        public __createReactiveState(state: S): S {
            return new Proxy(state, {
                set: (target, prop, value) => {
                    if (target[prop as keyof S] !== value) {
                        target[prop as keyof S] = value;
                        this.__listeners[prop as keyof T]?.forEach((cb) => cb());
                    }
                    return true;
                },
            });
        }
    }

    Object.defineProperty(service, 'name', { value: target.name });

    return service;
}