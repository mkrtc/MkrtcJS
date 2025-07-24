import "reflect-metadata";
import { INJECT_SERVICE_META_KEY } from "@/common/index.js";
import { ClientDIContainer } from "@/di/index.js";
import { ClassType, DecoratorMetadata } from "@/types/index.js";
import { IService } from "src/client/index.js";
import { IsNotServiceException } from "@/exceptions/index.js";
import { initClientService } from "@/src/utils/init-client-service.js";

export interface InjectServiceOptions{
    init?: boolean;
}

export const InjectService = (scope?: string | null, options?: InjectServiceOptions): PropertyDecorator => (target, propertyKey) => {
    const type: ClassType<IService> = Reflect.getMetadata("design:type", target, propertyKey);
    const serviceDiContainer = ClientDIContainer.get("services");
    const name = scope ? `${type.name}#${scope}` : type.name;

    if(!serviceDiContainer.has(name)){
        if(!options?.init) throw new Error(`Service ${name} not inited!`);
        const [service] = initClientService(ClientDIContainer, type, {scope: scope ?? undefined})
        if(!service.__isService) throw new IsNotServiceException(name);
        service.__init();
        serviceDiContainer.set(name, new type()); 
    }

    const inject = async () => {
        const injects: DecoratorMetadata[] = Reflect.getMetadata(INJECT_SERVICE_META_KEY, target) ?? [];
        const service = serviceDiContainer.get(name);
        if(!service?.__initialized){
            await service?.__init();
        }

        injects.push({key: String(propertyKey), value: service});
        Reflect.defineMetadata(INJECT_SERVICE_META_KEY, injects, target);
    }

    inject()

}