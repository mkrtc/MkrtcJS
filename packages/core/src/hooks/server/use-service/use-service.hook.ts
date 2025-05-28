"use server"
import { ServerDIContainer } from "@/di"
import { UseServiceOptions } from "@/types";
import { initServerService } from "@/utils/init-server-service";


export const useService = async <C>(ServiceClass: new (...args: any[]) => C, options?: UseServiceOptions): Promise<[C]> => {
    const [service] = await initServerService<C>(ServerDIContainer, ServiceClass, options);
    
    return [service as C];
}