"use server"
import { IService } from "@/decorators/server";
import { NextCookies, NextHeaders } from "@/types";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies, headers } from "next/headers";

export class ServerDIContainer{
    public static cookies: NextCookies;
    public static services: Map<string, IService> = new Map<string, IService>();
    public static headers: NextHeaders;

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