import { COOKIES_PARAM_META_KEY, PATHNAME_PARAM_META_KEY, ROUTER_PARAM_META_KEY } from "@/common";
import { ClientDIContainer } from "@/di";
import { DecoratorMetadata } from "@/types";
import { getParamMetadata } from "@/utils";
import "reflect-metadata";

export const UseNavigator = (): MethodDecorator => (target, propertyKey, descriptor: PropertyDescriptor) => {
    const method: Function = descriptor.value;
    if (typeof method !== "function") return;


    descriptor.value = function (...args: any[]) {
        if (typeof window === "undefined") {
            return method.apply(this, args);
        }

        const cookiesParams = getParamMetadata(COOKIES_PARAM_META_KEY, propertyKey, target);
        const pathname = getParamMetadata(PATHNAME_PARAM_META_KEY, propertyKey, target) || [];
        const router = getParamMetadata(ROUTER_PARAM_META_KEY, propertyKey, target) || [];

        cookiesParams.forEach(param => {
            args[param.value] = ClientDIContainer?.get("cookies") || [];
        })

        pathname.forEach(param => {
            args[param.value] = ClientDIContainer.getOrThrow("path");
        });

        router.map(param => {
            args[param.value] = ClientDIContainer.getOrThrow("router");
        })

        const result = method.apply(this, args);

        return result;
    }
}