import type { IService } from "@/decorators/server/index.js";
import type { MkrtcRequest, NextCookies, NextHeaders } from "@/types/index.js";



export class ServerDIContainer{
    public static cookies: NextCookies;
    public static services: Map<string, IService> = new Map<string, IService>();
    public static headers: NextHeaders;
    public static toClientMetadata: Map<string, any> = new Map<string, any>();
    public static hasClientMetadataServices: Map<string, IService> = new Map<string, IService>();
    public static clientMetadataServices: Map<string, new (...args: any[]) => IService> = new Map<string, new (...args: any[]) => IService>();
    public static request: MkrtcRequest | null = null;

    public static set<K extends keyof typeof ServerDIContainer>(key: K, value: typeof ServerDIContainer[K]){
        this[key] = value;
    }

    public static get<K extends keyof typeof ServerDIContainer>(key: K): typeof ServerDIContainer[K]{
        return this[key];
    }

    public static getOrThrow<K extends keyof typeof ServerDIContainer>(key: K): typeof ServerDIContainer[K]{
        const value = this[key];
        if (typeof value === "undefined") throw new Error(`[DIContainer] ${key} is not set`);
        return value;
    }
}