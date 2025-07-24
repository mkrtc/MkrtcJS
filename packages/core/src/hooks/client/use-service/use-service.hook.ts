"use client"
import "reflect-metadata";
import type { UseServiceOptions, UseField, KUseServiceAll, KUseServiceSpecific, DecoratorMetadata, ClassType } from "@/types/index.js";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { initClientService } from "@/utils/index.js";
import { StateNotFoundException } from "@/exceptions/index.js";
import { ClientDIContainer } from "@/di/index.js";
import { IService } from "src/client/index.js";
import { ON_PATH_CHANGE_META_KEY } from "@/common/index.js";
import { usePathname } from "next/navigation.js";
import { v4 } from "uuid";



export function useService<C, S extends Record<string, any>, K extends keyof S = keyof S>(
    ServiceClass: ClassType<C>,
    state: K[],
    options?: UseServiceOptions
): [C, Record<K, S[K]>] {
    const instanceId = useRef(v4()).current;
    const serviceRef = useRef<IService<S>>(null);
    const diKeyRef = useRef<string>(null);
    const serviceRefCount = ClientDIContainer.get("serviceRefCount");
    const serviceOwners = ClientDIContainer.get("serviceOwners");
    const serviceDiContainer = ClientDIContainer.get("services");
    const pathname = usePathname();

    if (!serviceRef.current || !diKeyRef.current) {
        const [service, diKey] = initClientService<C, S>(ClientDIContainer, ServiceClass, options);
        serviceRef.current = service;
        diKeyRef.current = diKey;

        if (!serviceRefCount.has(diKey)) {
            serviceRefCount.set(diKey, 0);
        }

        if (!serviceOwners.has(diKey)) {
            serviceOwners.set(diKey, new Set());
        }
    }

    const diKey = diKeyRef.current;
    const service = serviceRef.current;

    const owners = serviceOwners.get(diKey)!;
    owners.add(instanceId);
    serviceRefCount.set(diKey, owners.size);

    useLayoutEffect(() => {
        const diKey = diKeyRef.current!;
        if(!serviceOwners.has(diKey)){
            serviceOwners.set(diKey, new Set());
        }
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

        for (const { value } of onPathChangeFuncs) {
            value.apply(service, [pathname]);
        }
    }, [pathname]);

    useEffect(() => {
        service.__init();
    }, [service])

    const selectedState = [service, {}] as [C, Record<K, S[K]>]; 

    const useField = <V>(key: keyof S): V => {
        const sv = selectedState[0] as IService<S>;
        if (typeof sv.__state[key] === "undefined") throw new StateNotFoundException(ServiceClass.name, key.toString());

        return useSyncExternalStore<V>(
            (cb) => service.__subscribeToKey(key, cb),
            () => service.__state[key],
            () => service.__state[key],
        );
    }

    for (const key of state) {
        selectedState[1][key] = useField(key);
    }

    return selectedState;
}