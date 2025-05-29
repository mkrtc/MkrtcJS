import { inject } from "@/utils";

export const Entity = () => <T extends { new(...args: any[]): object }>(target: T) => {
    class Entity extends target {
        constructor(...args: any[]) {
            super(...args);
            inject.call(this);
        }
    }

    Object.defineProperty(Entity, 'name', { value: target.name });

    return Entity;
}