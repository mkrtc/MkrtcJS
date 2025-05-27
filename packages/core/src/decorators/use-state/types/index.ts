export type Mapper<K extends object, C, A extends any[] = any[]> = (instance: C, args: A) => UseStateOptionsMap<K, C, A>;
export type Updater<S, C, A> = (current: S, args: A, instance: C) => S;

export interface UseStateErrorOptions<C, A extends any[]> {
    reThrow?: boolean;
    return?: boolean;
    callback?: <E extends Error = Error>(error: E, instance: C, args: A) => any;
}

export type UseStateOptionsMap<K extends object, C, A extends any[] = any[]> = {
    [Key in keyof K]: {
        key: Key;
        value?: K[Key];
        useReturnValue?: boolean;
        log?: boolean;
        use?: "before" | "after";
        error?: UseStateErrorOptions<C, A>
    }
}[keyof K];


export interface UseStateOptions<C, A extends any[] = any[]> {
    log?: boolean;
    error?: UseStateErrorOptions<C, A>
}

export interface IUseState {
    return<S extends object, C, A extends any[] = []>(key: keyof S, options?: UseStateOptions<C, A>): MethodDecorator;
    before<S extends object, C, A extends any[], K extends keyof S = keyof S>(
        key: K,
        updater: Updater<S[K], C, A>,
        options?: UseStateOptions<C, A>
    ): MethodDecorator;

    after<S extends object, C, A extends any[], K extends keyof S>(
        key: K,
        updater: Updater<S[K], C, A>,
        options?: UseStateOptions<C, A>
    ): MethodDecorator;

    increment<S extends object, C, A extends any[]>(
        key: keyof S,
        options?: UseStateOptions<C, A>
    ): MethodDecorator;

    decrement<S extends object, C, A extends any[]>(
        key: keyof S,
        options?: UseStateOptions<C, A>
    ): MethodDecorator;

    toggle<S extends object, C, A extends any[]>(
        key: keyof S,
        options?: UseStateOptions<C, A>
    ): MethodDecorator;


    patch: <S extends object, C, K extends keyof S>(key: K, options?: UseStateOptions<C>) => {
        after: <A extends any[]>(updater: Updater<S[K], C, A>) => MethodDecorator;
        before: <A extends any[]>(updater: Updater<S[K], C, A>) => MethodDecorator;
        increment: () => MethodDecorator;
        decrement: () => MethodDecorator;
        toggle: () => MethodDecorator;
    }
}

export interface IUseStateFactory<S extends object, C> {
    return: <A extends any[]>(key: keyof S, options?: UseStateOptions<C, A>) => MethodDecorator;
    after: <A extends any[], K extends keyof S>(key: K, updater: Updater<S[K], C, A>, options?: UseStateOptions<C, A>) => MethodDecorator;
    before: <A extends any[], K extends keyof S>(key: K, updater: Updater<S[K], C, A>, options?: UseStateOptions<C, A>) => MethodDecorator;
    increment<A extends any[]>(key: keyof S, options?: UseStateOptions<C, A>): MethodDecorator;
    decrement<A extends any[]>(key: keyof S, options?: UseStateOptions<C, A>): MethodDecorator;
    toggle<A extends any[]>(key: keyof S, options?: UseStateOptions<C, A>): MethodDecorator;
    patch: <K extends keyof S>(key: K, options?: UseStateOptions<C>) => {
        after: <A extends any[]>(updater: Updater<S[K], C, A>) => MethodDecorator;
        before: <A extends any[]>(updater: Updater<S[K], C, A>) => MethodDecorator;
        increment: () => MethodDecorator;
        decrement: () => MethodDecorator;
        toggle: () => MethodDecorator;
    }
}