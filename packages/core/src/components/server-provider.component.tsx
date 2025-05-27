"use server"
import React, { FC } from "react"

interface ServerProviderProps{
    children: React.ReactNode;
}
export const ServerProvider:FC<ServerProviderProps> = async ({children, ...props}) => {
    return <>{children}</>

}