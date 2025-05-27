import { IsNotServiceException, StateNotFoundException } from "exceptions";
import { IService } from "../service";
import type { IUseState, Mapper, Updater, UseStateOptions } from "./types";

const methodApply = <S extends object, I, A extends any[] = []>(mapper: Mapper<S, I, A>): MethodDecorator =>
    (target, propertyKey, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        if (typeof method !== "function") throw new Error(`${target.constructor.name}#${propertyKey.toString()} is not method`);
        descriptor.value = async function (...args: unknown[]) {
            const service = this as IService<S>;
            if(!service.__isService) throw new IsNotServiceException(`[UseState] ${target.constructor.name}`);
             
            const update = mapper(this as I, args as A);

            try {
                if (update.use === "before") {
                    if (!(update.key in service.__state)) throw new StateNotFoundException(`[UseState] ${target.constructor.name}`, update.key.toString());

                    service.__setState(update.key.toString(), update.value);

                    if (update.log) console.log(`[UseState] ${update.key.toString()} = ${update.value?.toString()}`);
                }

                const result = await method.apply(this, args);


                if (!(update.key in service.__state)) throw new StateNotFoundException(`[UseState] ${target.constructor.name}`, update.key.toString());

                if (update.use !== "before") {
                    const value = update.useReturnValue ? result : update?.value;
                    service.__setState(update.key.toString(), value);
                    if (update.log) console.log(`[UseState] ${update.key.toString()} = ${value.toString()}`);
                }


                return result;
            } catch (exception) {
                const exp: Error = exception as Error;
                const { error } = update;
                if (error?.reThrow) throw error.callback?.(exp, this as I, args as A);
                if (error?.return) return await error.callback?.(exp, this as I, args as A);

                await error?.callback?.(exp, this as I, args as A);

                throw exp;
            }
        }

    }

export const UseState: IUseState = {
    return<S extends object, I, A extends any[] = []>(key: keyof S, options?: UseStateOptions<I, A>): MethodDecorator {
        return methodApply<S, I, A>(() => ({ ...options, key, useReturnValue: true }))
    },
    before<S extends object, I, A extends any[], K extends keyof S>(
        key: keyof S, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return methodApply<S, I, A>((instance, args) => ({
            ...options,
            key,
            value: updater(instance["__state" as keyof I][key as keyof object] as S[K], args, instance),
            use: "before"
        }))
    },
    after<S extends object, I, A extends any[], K extends keyof S>(
        key: keyof S, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return methodApply<S, I, A>((instance, args) => ({
            ...options,
            key,
            value: updater(instance["__state" as keyof I][key as keyof object] as S[K], args, instance),
            use: "after"
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

    decrement<S extends object, I, A extends any[], K extends keyof S>(
        key: keyof S, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return this.before<S, I, A>(key, (_, __, instance) => {
            const value = instance["__state" as keyof I][key as keyof object];
            if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

            return value - 1 as S[keyof S];
        }, options);
    },

    toggle<S extends object, I, A extends any[], K extends keyof S>(
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
            after<A extends any[]>(updater: Updater<S[K], I, A>) {
                return methodApply<S, I, A>((instance, args) => ({
                    ...options,
                    key,
                    value: updater(instance["__state" as keyof I][key as keyof object] as S[K], args, instance),
                    use: "after"
                }))
            },

            before<A extends any[]>(updater: Updater<S[K], I, A>) {
                return methodApply<S, I, A>((instance, args) => ({
                    ...options,
                    key,
                    value: updater(instance["__state" as keyof I][key as keyof object] as S[K], args, instance),
                    use: "before"
                }))
            },

            increment() {
                return methodApply<S, I>(instance => {
                    const value = instance["__state" as keyof I][key as keyof object];
                    if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

                    return {
                        ...options,
                        key,
                        value: (value + 1) as S[K],
                        use: "before"
                    }
                })
            },
            decrement() {
                return methodApply<S, I>(instance => {
                    const value = instance["__state" as keyof I][key as keyof object];
                    if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

                    return {
                        ...options,
                        key,
                        value: (value - 1) as S[K],
                        use: "before"
                    }
                })
            },
            toggle() {
                return methodApply<S, I>(instance => {
                    const value = instance["__state" as keyof I][key as keyof object];
                    if (typeof value !== "boolean") throw new Error(`[UseState] ${key.toString()} is not boolean`);

                    return {
                        ...options,
                        key,
                        value: !value as S[K],
                        use: "before"
                    }
                })
            },
        }
    }
}