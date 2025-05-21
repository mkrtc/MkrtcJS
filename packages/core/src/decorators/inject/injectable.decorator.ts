import { InjectableDiContainer } from "@/di";

export function Injectable(): ClassDecorator {
    return function (target: any) {
        InjectableDiContainer.set(target, new target());
    }
}