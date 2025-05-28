import "reflect-metadata";
import type { DecoratorMetadata } from "@/types";

import { ON_INIT_META_KEY } from "@/common";


export async function onInit(this: any){
    const onInit: DecoratorMetadata[] = Reflect.getMetadata(ON_INIT_META_KEY, this) ?? [];

    for(const {key} of onInit){
        const method = this[key];
        if(typeof method !== 'function') throw new Error(`Method ${key} is not a function`);
        await method.call(this);
    }
}