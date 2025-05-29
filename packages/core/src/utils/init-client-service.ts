import type { UseServiceOptions } from "@/types";
import type { ClientDIContainer } from "@/di";
import { IsNotServiceException } from "exceptions";
import { IService } from "client";

export const initClientService = <C, S extends Record<string, any>>(container: typeof ClientDIContainer, ServiceClass: new (...args: any[]) => C, options?: UseServiceOptions): [IService<S>, string] => {
    let key: string = ServiceClass.name;
    const serviceDiContainer = container.get("services");

    if (options) {
        if (options.scope) {
            let key = `${ServiceClass.name}#${options.scope}`;;
            if (serviceDiContainer.has(key)) {
                const inst = serviceDiContainer.get(key) as IService<S>;
                return [inst, key];
            }
            const inst = new ServiceClass() as IService<S>;
            if(!inst.__isService) throw new IsNotServiceException(ServiceClass.name);

            if (typeof options.isGlobal !== "undefined") {
                inst.__isGlobal = options.isGlobal;
            }
            serviceDiContainer.set(key, inst);
            return [inst, key];

        }
    }

    let inst = serviceDiContainer.get(key) as IService<S>;
    if (!inst) {
        inst = new ServiceClass() as IService<S>;
        if(!inst.__isService) throw new IsNotServiceException(ServiceClass.name);
        
        serviceDiContainer.set(key, inst);
    }
    if (options && typeof options.isGlobal !== "undefined") {
        inst.__isGlobal = options.isGlobal;
    }
    return [inst, key];
};