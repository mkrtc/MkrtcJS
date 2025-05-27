"use server"
import { inject, onInit } from "@/utils";
export interface IService {
    __isService: boolean;
    __isGlobal: boolean;
}

interface ServiceOptions {
    isGlobal: boolean;
}

export const Service = <S extends Record<string, any> = Record<string, any>>(options?: ServiceOptions) => <T extends { new(...args: any[]): object }>(target: T) => {
    const service = class extends target implements IService {
        public __isService: boolean;
        public __isGlobal: boolean;
        constructor(...args: any[]) {
            super(args);
            inject.call(this);
            onInit.call(this);

            this.__isService = true;
            this.__isGlobal = options?.isGlobal ?? false;
        }
    }

    Object.defineProperty(service, 'name', { value: target.name });

    return service;
}