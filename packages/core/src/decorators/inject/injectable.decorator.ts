import { ClientDIContainer } from "@/di/index.js";

export function Injectable(): ClassDecorator {
    return function (target: any) {
        ClientDIContainer.get("injectable").set(target, new target());
    }
}