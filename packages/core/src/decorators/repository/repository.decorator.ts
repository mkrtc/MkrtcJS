import { inject } from "@/utils";

export const Repository = () => <T extends { new(...args: any[]): object }>(target: T) => {
    const repository = class extends target {
        constructor(...args: any[]) {
            super(...args);
            inject.call(this);
        }
    }

    Object.defineProperty(repository, 'name', { value: target.name });

    return repository;
}