import { inject } from "@/utils/index.js";

export const Repository = () => <T extends { new(...args: any[]): object }>(target: T) => {
    class Repository extends target {
        constructor(...args: any[]) {
            super(...args);
            inject.call(this);
        }
    }

    Object.defineProperty(Repository, 'name', { value: target.name });
    return Repository;
}