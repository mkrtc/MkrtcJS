import type { AbstractService } from "@/common";
import type { IUseStateFactory, Updater, UseStateOptions } from "../types";

import { UseState } from "../use-state.decorator";


export const UseStateFactory = {
    create: <S extends object, I extends AbstractService>(): IUseStateFactory<S, I> => ({
        after: <A extends any[], K extends keyof S>(key: K, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>) => UseState.after<S, I, A, K>(key, updater, options),
        before: <A extends any[], K extends keyof S>(key: K, updater: Updater<S[K], I, A>, options?: UseStateOptions<I, A>) => UseState.before<S, I, A, K>(key, updater, options),
        return: <A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>) => UseState.return<S, I, A>(key, options),
        increment: <A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>) => UseState.increment<S, I, A>(key, options),
        decrement: <A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>) => UseState.decrement<S, I, A>(key, options),
        toggle: <A extends any[]>(key: keyof S, options?: UseStateOptions<I, A>) => UseState.toggle<S, I, A>(key, options),
        patch: <K extends keyof S>(key: K, options?: UseStateOptions<I>) => UseState.patch(key, options)
    })
} as const;