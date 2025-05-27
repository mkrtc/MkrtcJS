
interface Service<C> {
    service: C;
}


type SelectedState<S, K extends keyof S> = {
    [P in K]: S[P]
};

type FullSelectedState<S> = {
    [K in keyof S]: S[K];
};

interface UseServiceOpts {
    scope?: string;
    isGlobal?: boolean;
}

export type UseServiceOptions = UseServiceOpts;
export type UseField<S> = <V>(key: keyof S) => V;
export type KUseServiceSpecific<C, S, K extends keyof S> = Service<C> & SelectedState<S, K>;
export type KUseServiceAll<C, S> = Service<C> & FullSelectedState<S>;