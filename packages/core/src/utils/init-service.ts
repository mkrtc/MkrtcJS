import { ServiceDiContainer } from "@/di";
import type { AbstractService } from "@/common";
import type { UseServiceOptions } from "@/types";

export const initService = <T extends AbstractService, K extends keyof T['state']>(ServiceClass: new (...args: any[]) => T, options?: UseServiceOptions) => {
    if (options) {
        if ("key" in options && "use" in options) throw new Error("Cannot use 'key' and 'use' at the same time");

        if ("use" in options) {
            const scoped = ServiceDiContainer.get(`${ServiceClass.name}#${options.use}`) as T;
            if (!scoped) throw new Error(`Service ${ServiceClass.name}#${options.use} not found`);
            return scoped;
        }

        if ("key" in options) {
            if (ServiceDiContainer.has(`${ServiceClass.name}#${options.key}`)) {
                throw new Error(`Service ${ServiceClass.name}#${options.key} already exists`);
            }
            const inst = new ServiceClass();
            ServiceDiContainer.set(`${ServiceClass.name}#${options.key}`, inst);
            return inst;
        }
    }

    let inst = ServiceDiContainer.get(ServiceClass.name) as T;
    if (!inst) {
        inst = new ServiceClass();
        ServiceDiContainer.set(ServiceClass.name, inst);
    }
    return inst;
};