"use server"
import "reflect-metadata";
import React, { FC } from "react";
import { ServerProvider } from "./server-provider.component.js";
import { ClientProvider } from "./client-provider.component.js";
import { cookies } from "next/headers.js";
import { ServerDIContainer } from "@/di/index.js";
import { TO_CLIENT_META_KEY } from "@/common/index.js";
import { DecoratorMetadata } from "@/types/index.js";

interface MkrtcRootProviderProps {
    children: React.ReactNode;
}
export const MkrtcRootProvider: FC<MkrtcRootProviderProps> = async ({ children }) => {
    const cookie = await cookies();
    const toClientMetadata = ServerDIContainer.get("clientMetadataServices");
    let metadata: Record<string, any> = {};
    for(const [key, service] of toClientMetadata){
        const metaKeys: DecoratorMetadata<string>[] = Reflect.getMetadata(TO_CLIENT_META_KEY, service.prototype) ?? [];
        if(!metaKeys.length) continue;
        const serviceInstance = new service();
        await serviceInstance.__init();
        for(const metaKey of metaKeys){
            const { key } = metaKey;
            metadata[key] = serviceInstance[key as keyof typeof service];
        }
    }
    return (
        <ServerProvider>
            <ClientProvider data={JSON.stringify(metadata)} cookies={cookie.getAll()}>{children}</ClientProvider>
        </ServerProvider>
    )
}