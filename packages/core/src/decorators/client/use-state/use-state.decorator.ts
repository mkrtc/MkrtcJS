import { IsNotServiceException, StateNotFoundException } from "exceptions";
import type { IUseState, Mapper, Updater, UseStateOptions, AfterUpdater } from "./types";
import type { IService } from "../service";

const methodApply = <S extends object, I, A extends any[] = []>(use: "before" | "after", mapper: Mapper<S, I, A>): MethodDecorator =>
    (target, propertyKey, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        if (typeof method !== "function") throw new Error(`${target.constructor.name}#${propertyKey.toString()} is not method`);
        descriptor.value = function (...args: unknown[]) {
            const service = this as IService<S>;
            if(!service.__isService) throw new IsNotServiceException(`[UseState] ${target.constructor.name}`);
             
            
            try {
                if (use === "before") {
                    const update = mapper(this as I, args as A);
                    if (!(update.key in service.__state)) throw new StateNotFoundException(`[UseState] ${target.constructor.name}`, update.key.toString());

                    service.__setState(update.key.toString(), update.value);

                    if (update.log) console.log(`[UseState] ${update.key.toString()} = ${update.value?.toString()}`);
                }

                const result = method.apply(this, args);
                
                
                if (use === "after") {
                    const update = mapper(this as I, args as A, result);
                    if (!(update.key in service.__state)) throw new StateNotFoundException(`[UseState] ${target.constructor.name}`, update.key.toString());
                    const value = update.useReturnValue ? result : update?.value;
                    service.__setState(update.key.toString(), value);
                    if (update.log) console.log(`[UseState] ${update.key.toString()} = ${value.toString()}`);
                }


                return result;
            } catch (exception) {
                const update = mapper(this as I, args as A);
                const exp: Error = exception as Error;
                const { error } = update;
                if (error?.reThrow) throw error.callback?.(exp, this as I, args as A);
                if (error?.return) return error.callback?.(exp, this as I, args as A);

                error?.callback?.(exp, this as I, args as A);

                throw exp;
            }
        }

    }

export const UseState: IUseState = {
    return<S extends object, I, A extends any[] = []>(key: keyof S, options?: UseStateOptions<I, A>): MethodDecorator {
        return methodApply<S, I, A>("after", () => ({ ...options, key, useReturnValue: true }))
    },
    before<S extends object, I, A extends any[], K extends keyof S>(
        key: keyof S, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return methodApply<S, I, A>("before", (instance, args) => ({
            ...options,
            key,
            value: updater(instance["__state" as keyof I][key as keyof object] as S[K], args, instance)
        }))
    },
    after<S extends object, R, I, A extends any[], K extends keyof S>(
        key: keyof S, updater: AfterUpdater<S[K], R, I, A>, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return methodApply<S, I, A>("after", (instance, args, rv) => ({
            ...options,
            key,
            value: updater(instance["__state" as keyof I][key as keyof object] as S[K], rv, args, instance)
        }))
    },

    increment<S extends object, I, A extends any[]>(
        key: keyof S, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return this.before<S, I, A>(key, (_, __, instance) => {
            const value = instance["__state" as keyof I][key as keyof object];
            if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

            return value + 1 as S[keyof S];
        }, options);
    },

    decrement<S extends object, I, A extends any[]>(
        key: keyof S, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return this.before<S, I, A>(key, (_, __, instance) => {
            const value = instance["__state" as keyof I][key as keyof object];
            if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

            return value - 1 as S[keyof S];
        }, options);
    },

    toggle<S extends object, I, A extends any[]>(
        key: keyof S, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return this.before<S, I, A>(key, (_, __, instance) => {
            const value = instance["__state" as keyof I][key as keyof object];
            if (typeof value !== "boolean") throw new Error(`[UseState] ${key.toString()} is not boolean`);

            return !value as S[keyof S];
        }, options);
    },

    patch<S extends object, I, K extends keyof S>(key: K, options?: UseStateOptions<I>) {
        return {
            after<A extends any[], R = any>(updater: AfterUpdater<S[K], R, I, A>) {
                return methodApply<S, I, A>("after", (instance, args, rv) => ({
                    ...options,
                    key,
                    value: updater(instance["__state" as keyof I][key as keyof object] as S[K], rv, args, instance)
                }))
            },

            before<A extends any[]>(updater: Updater<S[K], I, A>) {
                return methodApply<S, I, A>("before", (instance, args) => ({
                    ...options,
                    key,
                    value: updater(instance["__state" as keyof I][key as keyof object] as S[K], args, instance)
                }))
            },

            increment() {
                return methodApply<S, I>("before", instance => {
                    const value = instance["__state" as keyof I][key as keyof object];
                    if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

                    return {
                        ...options,
                        key,
                        value: (value + 1) as S[K]
                    }
                })
            },
            decrement() {
                return methodApply<S, I>("before", instance => {
                    const value = instance["__state" as keyof I][key as keyof object];
                    if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

                    return {
                        ...options,
                        key,
                        value: (value - 1) as S[K]
                    }
                })
            },
            toggle() {
                return methodApply<S, I>("before", instance => {
                    const value = instance["__state" as keyof I][key as keyof object];
                    if (typeof value !== "boolean") throw new Error(`[UseState] ${key.toString()} is not boolean`);

                    return {
                        ...options,
                        key,
                        value: !value as S[K]
                    }
                })
            },
        }
    }
}