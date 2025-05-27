"use client"
import React, { FC, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClientDIContainer } from "@/di";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";


interface ClientProviderProps {
    children: React.ReactNode;
    cookies: RequestCookie[];
}

export const ClientProvider: FC<ClientProviderProps> = ({ children, cookies }) => {
    const router = useRouter();
    const pathname = usePathname();
    
    ClientDIContainer.set("path", pathname);
    ClientDIContainer.set("cookies", cookies);

    ClientDIContainer.set("router", router);

    return (
        <>{children}</>
    )

}