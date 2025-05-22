import { ServiceDiContainer } from "@/di";
import type { AbstractService } from "@/common";
import type { UseServiceOptions } from "@/types";

export const initService = <T extends AbstractService, K extends keyof T['state']>(ServiceClass: new (...args: any[]) => T, options?: UseServiceOptions): [T, string] => {
    let key: string = ServiceClass.name;
    if (options) {
        if ("key" in options && "use" in options) throw new Error("Cannot use 'key' and 'use' at the same time");

        if ("use" in options) {
            key = `${ServiceClass.name}#${options.use}`;
            const scoped = ServiceDiContainer.get(key) as T;
            if (!scoped) throw new Error(`Service ${key} not found`);
            return [scoped, key];
        }

        if ("key" in options) {
            let key = `${ServiceClass.name}#${options.key}`;;
            if (ServiceDiContainer.has(key)) {
                throw new Error(`Service ${key} already exists`);
            }
            const inst = new ServiceClass();
            ServiceDiContainer.set(key, inst);
            return [inst, key];
        }
    }
    
    let inst = ServiceDiContainer.get(key) as T;
    if (!inst) {
        inst = new ServiceClass();
        ServiceDiContainer.set(key, inst);
    }
    return [inst, key];
};