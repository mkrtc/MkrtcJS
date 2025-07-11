import "reflect-metadata";
import { INJECT_SERVICE_META_KEY } from "@/common/index.js";
import { ClientDIContainer } from "@/di/index.js";
import { DecoratorMetadata } from "@/types/index.js";
import { IService } from "src/client/index.js";
import { IsNotServiceException } from "@/exceptions/index.js";

export interface InjectServiceOptions{
    init?: boolean;
}

export const InjectService = (scope?: string | null, options?: InjectServiceOptions): PropertyDecorator => (target, propertyKey) => {
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    const serviceDiContainer = ClientDIContainer.get("services");
    const name = scope ? `${type.constructor.name}#${scope}` : type.constructor.name;

    if(!serviceDiContainer.has(name)){
        if(!options?.init) throw new Error(`Service ${name} not inited!`);
        const service: IService = new type();
        if(!service.__isService) throw new IsNotServiceException(name);

        serviceDiContainer.set(name, new type()); 
    }

    const injects: DecoratorMetadata[] = Reflect.getMetadata(INJECT_SERVICE_META_KEY, target) ?? [];
    injects.push({key: String(propertyKey), value: serviceDiContainer.get(name)});
    Reflect.defineMetadata(INJECT_SERVICE_META_KEY, injects, target);

}