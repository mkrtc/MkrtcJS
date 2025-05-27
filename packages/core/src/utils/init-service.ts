import { ServiceDiContainer } from "@/di";
import type { UseServiceOptions } from "@/types";
import { IService } from "@/decorators";
import { IsNotServiceException } from "exceptions";

export const initService = <C, S extends Record<string, any>>(ServiceClass: new (...args: any[]) => C, options?: UseServiceOptions): [IService<S>, string] => {
    let key: string = ServiceClass.name;
    if (options) {
        if (options.scope) {
            let key = `${ServiceClass.name}#${options.scope}`;;
            if (ServiceDiContainer.has(key)) {
                const inst = ServiceDiContainer.get(key) as IService<S>;
                return [inst, key];
            }
            const inst = new ServiceClass() as IService<S>;
            if(!inst.__isService) throw new IsNotServiceException(ServiceClass.name);

            if (typeof options.isGlobal !== "undefined") {
                inst.__isGlobal = options.isGlobal;
            }
            ServiceDiContainer.set(key, inst);
            return [inst, key];

        }
    }

    let inst = ServiceDiContainer.get(key) as IService<S>;
    if (!inst) {
        inst = new ServiceClass() as IService<S>;
        if(!inst.__isService) throw new IsNotServiceException(ServiceClass.name);
        ServiceDiContainer.set(key, inst);
    }
    if (options && typeof options.isGlobal !== "undefined") {
        inst.__isGlobal = options.isGlobal;
    }
    return [inst, key];
};