"use client"
import React, { FC, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation.js";
import { ClientDIContainer } from "@/di/index.js";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";


interface ClientProviderProps {
    children: React.ReactNode;
    cookies: RequestCookie[];
    data: string;
}

export const ClientProvider: FC<ClientProviderProps> = ({ children, cookies, data }) => {
    const router = useRouter();
    const pathname = usePathname();
    const fromServerMetadata: Record<string, any> = JSON.parse(data);

    for(const key in fromServerMetadata){
        ClientDIContainer.get('fromServerMetadata').set(key, fromServerMetadata[key]);
    }
    
    ClientDIContainer.set("path", pathname);
    ClientDIContainer.set("cookies", cookies);

    ClientDIContainer.set("router", router);

    return (
        <>{children}</>
    )

}