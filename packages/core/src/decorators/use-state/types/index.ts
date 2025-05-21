import type { AbstractService } from "@/common";

export type Mapper<K extends object, I extends AbstractService, A extends any[] = any[]> = (instance: I, args: A) => UseStateOptionsMap<K, I, A>;
export type Updater<S, I, A> = (current: S, args: A, instance: I) => S;

export interface UseStateErrorOptions<I extends AbstractService, A extends any[]> {
    reThrow?: boolean;
    return?: boolean;
    callback?: <E extends Error = Error>(error: E, instance: I, args: A) => any;
}

export type UseStateOptionsMap<K extends object, I extends AbstractService, A extends any[] = any[]> = {
    [Key in keyof K]: {
        key: Key;
        value?: K[Key];
        useReturnValue?: boolean;
        log?: boolean;
        use?: "before" | "after";
        error?: UseStateErrorOptions<I, A>
    }
}[keyof K];


export interface UseStateOptions<I extends AbstractService, A extends any[] = any[]> {
    log?: boolean;
    error?: UseStateErrorOptions<I, A>
}

export interface IUseState {
    return<S extends object, I extends AbstractService = AbstractService, A extends any[] = []>(key: keyof S, options?: UseStateOptions<I, A>): MethodDecorator;
    before<S extends object, I extends AbstractService, A extends any[], K extends keyof S = keyof S>(
        key: K,
        updater: Updater<S[K], I, A>,
        options?: UseStateOptions<I, A>
    ): MethodDecorator;

    after<S extends object, I extends AbstractService, A extends any[], K extends keyof S>(
        key: K,
        updater: Updater<S[K], I, A>,
        options?: UseStateOptions<I, A>
    ): MethodDecorator;

    increment<S extends object, I extends AbstractService, A extends any[]>(
        key: keyof S,
        options?: UseStateOptions<I, A>
    ): MethodDecorator;

    decrement<S extends object, I extends AbstractService, A extends any[]>(
        key: keyof S,
        options?: UseStateOptions<I, A>
    ): MethodDecorator;

    toggle<S extends object, I extends AbstractService, A extends any[]>(
        key: keyof S,
        options?: UseStateOptions<I, A>
    ): MethodDecorator;


    patch: <S extends object, I extends AbstractService, K extends keyof S>(key: K, options?: UseStateOptions<I>) => {
        after: <A extends any[]>(updater: Updater<S[K], I, A>) => MethodDecorator;
        before: <A extends any[]>(updater: Updater<S[K], I, A>) => MethodDecorator;
        increment: () => MethodDecorator;
        decrement: () => MethodDecorator;
        toggle: () => MethodDecorator;
    }
}

export interface IUseStateFactory<S extends object, I extends AbstractService = AbstractService> {
    return: <A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>) => MethodDecorator;
    after: <A extends any[], K extends keyof S>(key: K, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>) => MethodDecorator;
    before: <A extends any[], K extends keyof S>(key: K, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>) => MethodDecorator;
    increment<A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>): MethodDecorator;
    decrement<A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>): MethodDecorator;
    toggle<A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>): MethodDecorator;
    patch: <K extends keyof S>(key: K, options?: UseStateOptions<I>) => {
        after: <A extends any[]>(updater: Updater<S[K], I, A>) => MethodDecorator;
        before: <A extends any[]>(updater: Updater<S[K], I, A>) => MethodDecorator;
        increment: () => MethodDecorator;
        decrement: () => MethodDecorator;
        toggle: () => MethodDecorator;
    }
}