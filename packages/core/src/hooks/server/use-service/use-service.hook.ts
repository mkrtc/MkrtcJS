"use server"
import { ServerDIContainer } from "@/di/index.js"
import { UseServiceOptions } from "@/types/index.js";
import { initServerService } from "@/utils/index.js";


export const useService = async <C>(ServiceClass: new (...args: any[]) => C, options?: UseServiceOptions): Promise<[C]> => {
    const [service] = await initServerService<C>(ServerDIContainer, ServiceClass, options);
    
    return [service as C];
}