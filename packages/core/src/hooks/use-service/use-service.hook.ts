"use client"
import type { UseServiceOptions, UseField, KUseServiceAll, KUseServiceSpecific } from "@/types";
import { AbstractService } from "@/common";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getDepsFromOptions, initService } from "@/utils";
import { ServiceDiContainer } from "@/di";


export function useService<T extends AbstractService<any>>(
    ServiceClass: new (...args: any[]) => T
): [T, UseField<T>];


export function useService<T extends AbstractService<any>>(
    ServiceClass: new (...args: any[]) => T,
    keys: Array<keyof T['state']>
): KUseServiceSpecific<T, keyof T['state']>;

export function useService<T extends AbstractService<any>>(
    ServiceClass: new (...args: any[]) => T,
    keys: "*"
): KUseServiceAll<T>;


export function useService<T extends AbstractService<any>>(
    ServiceClass: new (...args: any[]) => T,
    keys: Array<keyof T['state']>,
    options: UseServiceOptions
): KUseServiceSpecific<T, keyof T['state']>;

export function useService<T extends AbstractService<any>>(
    ServiceClass: new (...args: any[]) => T,
    keys: "*",
    options: UseServiceOptions
): KUseServiceAll<T>;


export function useService<T extends AbstractService<any>>(
    ServiceClass: new (...args: any[]) => T,
    keys?: Array<keyof T['state']> | "*",
    options?: UseServiceOptions
): KUseServiceSpecific<T, keyof T['state']> | KUseServiceAll<T> | [T, UseField<T>] {
    const [service, diKey] = useMemo(() => initService(ServiceClass, options), [ServiceClass, getDepsFromOptions(options)]);

    const stateKeys: string[] = Object.keys(service.state);
    const selectedState = {service} as KUseServiceSpecific<T, keyof T['state']>;

    useEffect(() => {
        return () => {
            if(!ServiceDiContainer.has(diKey)) return;
            if("__isGlobal" in service && service.__isGlobal) return;
            
            service.destroy();
            ServiceDiContainer.delete(diKey);
        }
    }, [])
    
    const useField = <V>(key: keyof T['state']): V => {
        if (typeof selectedState.service['state'][key] === "undefined") throw new Error(`Key ${key.toString()} not found in service ${ServiceClass.name}`);

        return useSyncExternalStore<V>(
            (cb) => service.subscribeToKey(key, cb),
            () => service.state[key],
            () => service.state[key],
        );
    }

    if (!keys && !options) return [service, useField];

    if (keys === "*") {
        for (const key of stateKeys) {
            (selectedState as any)[key] = useField(key);
        }

        return selectedState;
    }

    if (keys && Array.isArray(keys)) {
        for (const key of keys) {
            (selectedState as any)[key] = useField(key);
        }

        return selectedState;
    }

    throw new Error("Invalid keys");

}