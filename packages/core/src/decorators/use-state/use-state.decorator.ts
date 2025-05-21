import type { IUseState, Mapper, Updater, UseStateOptions } from "./types";
import { AbstractService } from "@/common";

const methodApply = <S extends object, I extends AbstractService = AbstractService<object>, A extends any[] = []>(mapper: Mapper<S, I, A>): MethodDecorator =>
    (target, propertyKey, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        if (typeof method !== "function") throw new Error(`${target.constructor.name}#${propertyKey.toString()} is not method`);
        descriptor.value = async function (...args: unknown[]) {
            if (!(this instanceof AbstractService)) {
                throw new Error(`${target.constructor.name} is not instance AbstractService or ${target.constructor.name} not have state property`)
            }

            const update = mapper(this as I, args as A);

            try {
                if (update.use === "before") {
                    if (!(update.key in this['state'])) throw new Error(`[UseState] ${update.key.toString()} not found in state`);
                    this['setState'](update.key, update.value);

                    if (update.log) console.log(`[UseState] ${update.key.toString()} = ${update.value?.toString()}`);
                }

                const result = await method.apply(this, args);


                if (!(update.key in this["state"])) throw new Error(`[UseState] ${update.key.toString()} not found in state`);

                if (update.use !== "before") {
                    const value = update.useReturnValue ? result : update?.value;
                    this['setState'](update.key, value);
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
    return<S extends object, I extends AbstractService = AbstractService, A extends any[] = []>(key: keyof S, options?: UseStateOptions<I, A>): MethodDecorator {
        return methodApply<S, I, A>(() => ({ ...options, key, useReturnValue: true }))
    },
    before<S extends object, I extends AbstractService, A extends any[], K extends keyof S>(
        key: keyof S, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return methodApply<S, I, A>((instance, args) => ({
            ...options,
            key,
            value: updater(instance["state"][key as keyof object] as S[K], args, instance),
            use: "before"
        }))
    },
    after<S extends object, I extends AbstractService, A extends any[], K extends keyof S>(
        key: keyof S, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return methodApply<S, I, A>((instance, args) => ({
            ...options,
            key,
            value: updater(instance["state"][key as keyof object] as S[K], args, instance),
            use: "after"
        }))
    },

    increment<S extends object, I extends AbstractService, A extends any[]>(
        key: keyof S, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return this.before<S, I, A>(key, (_, __, instance) => {
            const value = instance["state"][key as keyof object];
            if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

            return value + 1 as S[keyof S];
        }, options);
    },

    decrement<S extends object, I extends AbstractService, A extends any[], K extends keyof S>(
        key: keyof S, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return this.before<S, I, A>(key, (_, __, instance) => {
            const value = instance["state"][key as keyof object];
            if (typeof value !== "number") throw new Error(`[UseState] ${key.toString()} is not number`);

            return value - 1 as S[keyof S];
        }, options);
    },

    toggle<S extends object, I extends AbstractService, A extends any[], K extends keyof S>(
        key: keyof S, options?: UseStateOptions<I, A>
    ): MethodDecorator {
        return this.before<S, I, A>(key, (_, __, instance) => {
            const value = instance["state"][key as keyof object];
            if (typeof value !== "boolean") throw new Error(`[UseState] ${key.toString()} is not boolean`);

            return !value as S[keyof S];
        }, options);
    },

    patch<S extends object, I extends AbstractService, K extends keyof S>(key: K, options?: UseStateOptions<I>) {
        return {
            after<A extends any[]>(updater: Updater<S[K], I, A>) {
                return methodApply<S, I, A>((instance, args) => ({
                    ...options,
                    key,
                    value: updater(instance["state"][key as keyof object] as S[K], args, instance),
                    use: "after"
                }))
            },

            before<A extends any[]>(updater: Updater<S[K], I, A>) {
                return methodApply<S, I, A>((instance, args) => ({
                    ...options,
                    key,
                    value: updater(instance["state"][key as keyof object] as S[K], args, instance),
                    use: "before"
                }))
            },

            increment() {
                return methodApply<S, I>(instance => {
                    const value = instance["state"][key as keyof object];
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
                    const value = instance["state"][key as keyof object];
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
                    const value = instance["state"][key as keyof object];
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