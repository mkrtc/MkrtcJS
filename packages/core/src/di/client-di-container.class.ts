import { IService } from "@/decorators/client";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export class ClientDIContainer{
    public static router: AppRouterInstance | null = null;
    public static path: string | null = null;
    public static injectable: Map<string, any> = new Map<string, any>();
    public static services: Map<string, IService> = new Map<string, IService>();
    public static serviceRefCount = new Map<string, number>();
    public static serviceOwners = new Map<string, Set<string>>();
    public static cookies: RequestCookie[] = [];
    public static fromServerMetadata: Map<string, any> = new Map<string, any>();

    public static set<K extends keyof typeof ClientDIContainer>(key: K, value: typeof ClientDIContainer[K]){
        this[key] = value;
    }

    public static get<K extends keyof typeof ClientDIContainer>(key: K): typeof ClientDIContainer[K]{
        return this[key];
    }

    public static getOrThrow<K extends keyof typeof ClientDIContainer>(key: K): typeof ClientDIContainer[K]{
        const value = this[key];
        if (typeof value === "undefined") throw new Error(`[DIContainer] ${key} is not set`);
        return value;
    }
}