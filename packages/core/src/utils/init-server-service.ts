import type { UseServiceOptions } from "@/types";
import type { ServerDIContainer } from "@/di";
import { IsNotServiceException } from "exceptions";
import { IService } from "server";

export const initServerService = <C>(container: typeof ServerDIContainer, ServiceClass: new (...args: any[]) => C, options?: UseServiceOptions): [IService, string] => {
    let key: string = ServiceClass.name;
    const serviceDiContainer = container.get("services");
    if (options) {
        if (options.scope) {
            let key = `${ServiceClass.name}#${options.scope}`;;
            if (serviceDiContainer.has(key)) {
                const inst = serviceDiContainer.get(key) as IService;
                return [inst, key];
            }
            const inst = new ServiceClass() as IService;
            if (!inst.__isService) throw new IsNotServiceException(ServiceClass.name);

            if (typeof options.isGlobal !== "undefined") {
                inst.__isGlobal = options.isGlobal;
            }
            serviceDiContainer.set(key, inst);
            return [inst, key];

        }
    }

    let inst = serviceDiContainer.get(key) as IService;
    if (!inst) {
        inst = new ServiceClass() as IService;
        if (!inst.__isService) throw new IsNotServiceException(ServiceClass.name);

        serviceDiContainer.set(key, inst);
    }
    if (options && typeof options.isGlobal !== "undefined") {
        inst.__isGlobal = options.isGlobal;
    }
    return [inst, key];
};