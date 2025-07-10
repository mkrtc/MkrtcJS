import { ClientDIContainer } from "@/di/index.js"


export const FromServer = (key?: string): PropertyDecorator => (target, propertyKey) => {
    const getter = function(){
        return ClientDIContainer.get("fromServerMetadata").get(key || propertyKey.toString()) || null;
    }
    
    Object.defineProperty(target, propertyKey, {
        get: getter,
        configurable: true,
        enumerable: true
    })
}