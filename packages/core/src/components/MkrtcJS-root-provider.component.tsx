"use server"
import React, { FC } from "react";
import { ServerProvider } from "./server-provider.component";
import { ClientProvider } from "./client-provider.component";
import { cookies } from "next/headers";

interface MkrtcJSRootProviderProps {
    children: React.ReactNode;
}
export const MkrtcJSRootProvider: FC<MkrtcJSRootProviderProps> = async ({ children }) => {
    const cookie = await cookies();
    return (
        <ServerProvider>
            <ClientProvider cookies={cookie.getAll()}>{children}</ClientProvider>
        </ServerProvider>
    )
}