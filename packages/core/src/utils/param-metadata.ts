import { DecoratorMetadata } from "@/types";


export const createParamMetadata = (key: string, index: number, propertyKey: string | symbol | undefined, target: object) => {
    const params: DecoratorMetadata<number>[] = Reflect.getMetadata(`${key}::${propertyKey?.toString()}`, target) || [];
    params.push({key: propertyKey?.toString() || "", value: index});
    Reflect.defineMetadata(`${key}::${propertyKey?.toString()}`, params, target);
}

export const getParamMetadata = (key: string, propertyKey: string | symbol | undefined, target: object): DecoratorMetadata<number>[] => {
    return Reflect.getMetadata(`${key}::${propertyKey?.toString()}`, target) || [];
}