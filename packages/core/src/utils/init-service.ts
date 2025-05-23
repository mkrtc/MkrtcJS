import { ServiceDiContainer } from "@/di";
import type { AbstractService } from "@/common";
import type { UseServiceOptions } from "@/types";

export const initService = <T extends AbstractService, K extends keyof T['state']>(ServiceClass: new (...args: any[]) => T, options?: UseServiceOptions): [T, string] => {
    let key: string = ServiceClass.name;
    if (options) {
        if (options.scope) {
            let key = `${ServiceClass.name}#${options.scope}`;;
            if (ServiceDiContainer.has(key)) {
                const inst = ServiceDiContainer.get(key) as T;
                return [inst, key];
            }
            const inst = new ServiceClass();
            if (typeof options.isGlobal !== "undefined") {
                (inst as any).__isGlobal = options.isGlobal;
            }
            ServiceDiContainer.set(key, inst);
            return [inst, key];

        }
    }

    let inst = ServiceDiContainer.get(key) as T;
    if (!inst) {
        inst = new ServiceClass();
        ServiceDiContainer.set(key, inst);
    }
    if (options && typeof options.isGlobal !== "undefined") {
        (inst as any).__isGlobal = options.isGlobal;
    }
    return [inst, key];
};