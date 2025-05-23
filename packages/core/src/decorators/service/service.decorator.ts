import "reflect-metadata";
import { AbstractService } from "@/common"
import { initState, inject, onInit } from "@/utils";


interface ServiceOptions{
    isGlobal: boolean;
}

export const Service = (options?: ServiceOptions) => <T extends { new(...args: any[]): object }>(target: T) => {
    const service = class extends target{
        public __isGlobal: boolean;
        constructor(...args: any[]) {
            super(...args);
            if (!(this instanceof AbstractService)) throw new Error(`${target.name} is not instance of AbstractService`);
            this.__isGlobal = options?.isGlobal || false;
            initState.call(this);
            inject.call(this);
            onInit.call(this);
        }
    }

    Object.defineProperty(service, 'name', { value: target.name });

    return service;
}