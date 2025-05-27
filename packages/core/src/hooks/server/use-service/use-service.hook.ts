"use server"
import { ServerDIContainer } from "@/di"
import { UseServiceOptions } from "@/types";
import { initServerService } from "@/utils/init-server-service";


export const useService = <C>(ServiceClass: new (...args: any[]) => C, options?: UseServiceOptions): [C] => {
    const [service, diKey] = initServerService<C>(ServerDIContainer, ServiceClass, options);
    
    return [service as C];
}