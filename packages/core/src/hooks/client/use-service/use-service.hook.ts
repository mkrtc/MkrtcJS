"use client"
import "reflect-metadata";
import type { UseServiceOptions, UseField, KUseServiceAll, KUseServiceSpecific, DecoratorMetadata } from "@/types/index.js";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { initClientService } from "@/utils/index.js";
import { StateNotFoundException } from "@/exceptions/index.js";
import { ClientDIContainer } from "@/di/index.js";
import { IService } from "src/client/index.js";
import { ON_PATH_CHANGE_META_KEY } from "@/common/index.js";
import { usePathname } from "next/navigation.js";
import { v4 } from "uuid";

export function useService<C, S extends Record<string, any>>(
    ServiceClass: new (...args: any[]) => C,
): [C, UseField<S>];

export function useService<C, S extends Record<string, any>>(
    ServiceClass: new (...args: any[]) => C,
    options?: UseServiceOptions
): [C, UseField<S>];


export function useService<C, S extends Record<string, any>>(
    ServiceClass: new (...args: any[]) => C,
    keys: Array<keyof S>
): KUseServiceSpecific<C, S, keyof S>;

export function useService<C, S extends Record<string, any>>(
    ServiceClass: new (...args: any[]) => C,
    keys: "*"
): KUseServiceAll<C, S>;


export function useService<C, S extends Record<string, any>>(
    ServiceClass: new (...args: any[]) => C,
    keys: Array<keyof S>,
    options: UseServiceOptions
): KUseServiceSpecific<C, S, keyof S>;

export function useService<C, S extends Record<string, any>>(
    ServiceClass: new (...args: any[]) => C,
    keys: "*",
    options: UseServiceOptions
): KUseServiceAll<C, S>;


export function useService<C, S extends Record<string, any>>(
    ServiceClass: new (...args: any[]) => C,
    keys?: Array<keyof S> | "*" | UseServiceOptions,
    options?: UseServiceOptions
): KUseServiceSpecific<C, S, keyof S> | KUseServiceAll<C, S> | [C, UseField<S>] {
    const instanceId = useRef(v4()).current;
    const serviceRef = useRef<IService<S>>(null);
    const diKeyRef = useRef<string>(null);
    const opts = (Array.isArray(keys) || typeof keys === "string") ? options : keys;
    const serviceRefCount = ClientDIContainer.get("serviceRefCount");
    const serviceOwners = ClientDIContainer.get("serviceOwners");
    const serviceDiContainer = ClientDIContainer.get("services");
    const pathname = usePathname();

    if (!serviceRef.current) {
        const [service, diKey] = initClientService<C, S>(ClientDIContainer, ServiceClass, opts);
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
                serviceRefCount.delete(diKey);
                serviceOwners.delete(diKey);
                if ((service as any).__isGlobal) return;
                service.__destroy();
                serviceDiContainer.delete(diKey);
            } else {
                serviceRefCount.set(diKey, owners.size);
            }
        };
    }, []);

    const onPathChangeFuncs: DecoratorMetadata<Function>[] = Reflect.getMetadata(ON_PATH_CHANGE_META_KEY, ServiceClass.prototype);
    useEffect(() => {
        if (!onPathChangeFuncs) return;

        for (const {value} of onPathChangeFuncs) {
                value.apply(service, [pathname]);
        }
    }, [pathname]);

    useEffect(() => {
        service.__init();
    }, [service])

    const stateKeys: string[] = Object.keys(service.__state);
    const selectedState = { service } as KUseServiceSpecific<C, S, keyof S>;

    const useField = <V>(key: keyof S): V => {
        const sv = selectedState.service as IService<S>;
        if (typeof sv.__state[key] === "undefined") throw new StateNotFoundException(ServiceClass.name, key.toString());

        return useSyncExternalStore<V>(
            (cb) => service.__subscribeToKey(key, cb),
            () => service.__state[key],
            () => service.__state[key],
        );
    }

    if (!keys || (!Array.isArray(keys) && typeof keys !== "string")) return [service as C, useField];

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