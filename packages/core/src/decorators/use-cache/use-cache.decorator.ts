
export interface UseCacheOptions{
    /**@default "mount" */
    storage: "mount" | "session_storage" | "local_storage";
}

interface Storage{
    ttl: number;
    value: any;
    args?: any[];
}

const cacheMap = new Map<string, Storage>();

const getCache = (key: string, storage: "mount" | "session_storage" | "local_storage"): Storage | null => {
    switch(storage){
        case "mount":
            return cacheMap.get(key) || null;
        case "session_storage": {
            const value = sessionStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        }
        case "local_storage": {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        }
    }
}


const setCache = (key: string, storage: "mount" | "session_storage" | "local_storage", value: Storage) => {
    switch(storage){
        case "mount":
            cacheMap.set(key, value);
            break;
        case "session_storage": {
            sessionStorage.setItem(key, JSON.stringify(value));
            break;
        }
        case "local_storage": {
            localStorage.setItem(key, JSON.stringify(value));
            break;
        }
    }
}

export const UseCache = (ttl: number, options?: UseCacheOptions): MethodDecorator | PropertyDecorator => (target, propertyKey, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    if(typeof method !== 'function') throw new Error(`Method ${propertyKey.toString()} is not a function`);

    descriptor.value = async function(...args: any[]){
        const key = `${this.constructor.name}#${propertyKey.toString()}`;
        const cached = getCache(key, options?.storage ?? "mount");

        if(cached && JSON.stringify(args) === JSON.stringify(cached.args)){
            return cached.value;
        }

        const result = await method.apply(this, args);
        setCache(key, options?.storage || "mount", {ttl, value: result, args});
        return result;
    }
}