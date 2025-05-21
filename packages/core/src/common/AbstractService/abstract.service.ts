import "reflect-metadata";
import type { DecoratorMetadata } from "@/types";
import { STATE_META_KEY, USE_EFFECT_META_KEY, WATCH_META_KEY } from "../constants";
import { IState } from "@/decorators";

type Listener = () => void;

export abstract class AbstractService<T extends object = Record<string, any>> {
    private _listeners: Partial<Record<keyof T, Set<Listener>>> = {};
    private _state: T;

    constructor() {
        const keys: DecoratorMetadata<IState>[] = Reflect.getMetadata(STATE_META_KEY, this);
        const value: T = keys.reduce<any>((prev, {key, value}) => {
            prev[key] = value.initialValue;
            return prev;
        }, {});

        this._state = this._createReactiveState(value);
    }

    public subscribeToKey<K extends keyof T>(key: K, cb: Listener) {
        if (!this._listeners[key]) {
            this._listeners[key] = new Set();
        }
        this._listeners[key]!.add(cb);
        return () => this._listeners[key]!.delete(cb);
    }

    public get state(): T {
        return this._state;
    }

    public setState<K extends keyof T>(key: K, value: T[K]) {
        const prevValue = this._state[key];
        this._state[key] = value;
        const effects: DecoratorMetadata<Function>[] = Reflect.getMetadata(USE_EFFECT_META_KEY, this) ?? [];
        const watch: DecoratorMetadata<Function>[] = Reflect.getMetadata(WATCH_META_KEY, this) ?? [];

        for(const {key: wchKey, value: wchMethod} of watch){
            if(wchKey === "*" || wchKey === key){
                wchMethod.apply(this, [key, prevValue, value]);
            }
        }

        for(const {key: effectKey, value: method} of effects){
            if((effectKey === "*" || key === effectKey) && JSON.stringify(prevValue) !== JSON.stringify(value)){
                method.apply(this, [key, prevValue, value]);
            }
        }
    }

    private _createReactiveState(state: T): T {
        return new Proxy(state, {
            set: (target, prop, value) => {
                if (target[prop as keyof T] !== value) {
                    target[prop as keyof T] = value;
                    this._listeners[prop as keyof T]?.forEach((cb) => cb());
                }
                return true;
            },
        });
    }
}