import { ClassType, UseServiceOptions } from "@/src/types/index.js";
import { useService } from "./use-service.hook.js";


export const UseServiceFactory = {
    create<C, S extends Record<string, any>, K extends keyof S = keyof S>(ServiceClass: ClassType<C>, options?: UseServiceOptions) {
        return (state: K[]) => useService<C, S, K>(ServiceClass, state, options);
    }
}