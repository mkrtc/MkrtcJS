"use server"
import "reflect-metadata";
import { TO_CLIENT_META_KEY } from "@/common";
import { DecoratorMetadata } from "@/types";


export const ToClient = (key?: string): PropertyDecorator => (target, propertyKey) => {
    const metadata: DecoratorMetadata<string>[] = Reflect.getMetadata(TO_CLIENT_META_KEY, target) || [];
    metadata.push({ key: key || propertyKey.toString(), value: "" });
    Reflect.defineMetadata(TO_CLIENT_META_KEY, metadata, target);
}