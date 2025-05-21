import type { AbstractService } from "@/common";

interface Service<T extends AbstractService> {
    service: T;
}


type SelectedState<T extends AbstractService<object>, K extends keyof T['state']> = {
    [P in K]: T['state'][P];
};

type FullSelectedState<T extends AbstractService<object>> = {
    [K in keyof T['state']]: T["state"][K];
};

interface UseServiceOpts {

}
interface UseServiceCreateOptions extends UseServiceOpts {
    use: string;
}

interface UseServiceGetOptions extends UseServiceOpts {
    key: string;
}

export type UseServiceOptions = UseServiceCreateOptions | UseServiceGetOptions;
export type UseField<T extends AbstractService> = <V>(key: keyof T['state']) => V;
export type KUseServiceSpecific<T extends AbstractService, K extends keyof T['state']> = Service<T> & SelectedState<T, K>;
export type KUseServiceAll<T extends AbstractService> = Service<T> & FullSelectedState<T>;