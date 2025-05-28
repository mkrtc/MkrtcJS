"use server"
import "reflect-metadata";
import { inject, onInit } from "@/utils";
import { ServerDIContainer } from "@/di";
import { ON_INIT_META_KEY } from "@/common";
import { DecoratorMetadata } from "@/types";
export interface IService {
    __isService: boolean;
    __isGlobal: boolean;
    __init(): Promise<void>;
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

            this.__isService = true;
            this.__isGlobal = options?.isGlobal ?? false;
        }

        public async __init() {
            await onInit.call(this);
        };
    }

    Object.defineProperty(service, 'name', { value: target.name });
    ServerDIContainer.get("clientMetadataServices").set(service.name, service);
    return service;
}