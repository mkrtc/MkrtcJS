import "reflect-metadata";
import { AbstractService } from "@/common"
import { initState, inject, onInit } from "@/utils";

export const Service = () => <T extends { new(...args: any[]): object }>(target: T) => {
    const service = class extends target {
        constructor(...args: any[]) {
            
            super(...args);
            if (!(this instanceof AbstractService)) throw new Error(`${target.name} is not instance of AbstractService`);
            initState.call(this);
            inject.call(this);
            onInit.call(this);
        }
    }

    Object.defineProperty(service, 'name', { value: target.name });

    return service;
}