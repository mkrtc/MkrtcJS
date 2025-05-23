"use client"
import type { UseServiceOptions, UseField, KUseServiceAll, KUseServiceSpecific } from "@/types";
import { AbstractService } from "@/common";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { initService } from "@/utils";
import { ServiceDiContainer } from "@/di";

const serviceRefCount = new Map<string, number>();
const serviceOwners = new Map<string, Set<string>>();

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
    const instanceId = useRef(crypto.randomUUID()).current;
    const serviceRef = useRef<T>(null);
    const diKeyRef = useRef<string>(null);

    if (!serviceRef.current) {
        const [service, diKey] = initService(ServiceClass, options);
        serviceRef.current = service;
        diKeyRef.current = diKey;

        if (!serviceRefCount.has(diKey)) {
            serviceRefCount.set(diKey, 0);
        }

        if (!serviceOwners.has(diKey)) {
            serviceOwners.set(diKey, new Set());
        }
    }

    const diKey = diKeyRef.current!;
    const service = serviceRef.current!;

    const owners = serviceOwners.get(diKey)!;
    owners.add(instanceId);
    serviceRefCount.set(diKey, owners.size);
    useLayoutEffect(() => {
        const diKey = diKeyRef.current!;
        const owners = serviceOwners.get(diKey)!;
        owners.add(instanceId);
        serviceRefCount.set(diKey, owners.size);

        return () => {
            owners.delete(instanceId);
            if (owners.size === 0) {
                service.destroy();
                serviceRefCount.delete(diKey);
                serviceOwners.delete(diKey);
                ServiceDiContainer.delete(diKey);
            } else {
                serviceRefCount.set(diKey, owners.size);
            }
        };
    }, []);

    const stateKeys: string[] = Object.keys(service.state);
    const selectedState = { service } as KUseServiceSpecific<T, keyof T['state']>;
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