import "reflect-metadata";
import { ON_DESTROY_KEY, STATE_META_KEY, USE_EFFECT_META_KEY, WATCH_META_KEY } from "@/common/index.js"
import { initState, inject, injectServiceToService, onInit } from "@/utils/index.js";
import { DecoratorMetadata } from "@/types/index.js";
import { IState } from "../index.js";

export abstract class IService<S extends Record<string, any> = Record<string, any>> {
    abstract __isGlobal: boolean;
    abstract __isService: boolean;
    abstract __listeners: Partial<Record<keyof S, Set<Listener>>>;
    abstract __state: S;
    abstract __initialized: boolean;
    abstract __isClient: boolean;
    abstract __subscribeToKey<K extends keyof S>(key: K, cb: Listener): () => boolean;
    abstract __destroy(): void;
    abstract __setState<K extends keyof Record<string, any>>(key: K, value: Record<string, any>[K]): void;
    abstract __createReactiveState(state: S): S;
    abstract __init(): Promise<void>;
}

type Listener = () => void;

interface ServiceOptions {
    isGlobal?: boolean;
}

export const Service = <S extends Record<string, any> = Record<string, any>>(options?: ServiceOptions) => <T extends { new(...args: any[]): object }>(target: T) => {

    return new Proxy(target, {
        construct(target, args, newTarget) {
            const instance: IService<S> = Reflect.construct(target, args, newTarget);
            instance.__isGlobal = options?.isGlobal || false;
            instance.__isService = true;
            instance.__listeners = {};
            instance.__initialized = false;
            instance.__isClient = true;
            instance.__createReactiveState = createReactiveState;
            instance.__subscribeToKey = subscribeToKey;
            instance.__setState = setState;
            instance.__destroy = destroy;
            instance.__init = init;

            const keys: DecoratorMetadata<IState>[] = Reflect.getMetadata(STATE_META_KEY, instance) || [];
            const value: S = keys.reduce<any>((prev, { key, value }) => {
                prev[key] = instance[key as keyof IService] || value.initialValue;
                return prev;
            }, {});

            instance.__state = instance.__createReactiveState(value);

            initState.call(instance);
            inject.call(instance);
            injectServiceToService.call(instance);

            return instance;
        }
    });
}

function createReactiveState<S extends Record<string, any>>(this: IService, state: S): S {
    return new Proxy(state, {
        set: (target, prop, value) => {
            if (target[prop as keyof S] !== value) {
                target[prop as keyof S] = value;
                this.__listeners[prop as keyof IService]?.forEach((cb) => cb());
            }
            return true;
        },
    });
}

function setState<K extends keyof Record<string, any>>(this: IService, key: K, value: Record<string, any>[K]) {
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

function destroy(this: IService) {
    const methods: DecoratorMetadata<Function>[] = Reflect.getMetadata(ON_DESTROY_KEY, this) ?? [];
    for (const { value } of methods) {
        value.apply(this);
    }
}

function subscribeToKey<K>(this: IService, key: K, cb: Listener): () => boolean {
    const k = key as keyof Partial<Record<string, Set<Listener>>>;
    if (!this.__listeners[k]) {
        this.__listeners[k] = new Set();
    }
    this.__listeners[k]!.add(cb);
    return () => this.__listeners[k]!.delete(cb);
}

async function init(this: IService): Promise<void> {
    if (this.__initialized) return;

    await onInit.call(this);
    this.__initialized = true;
}