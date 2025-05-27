import "reflect-metadata";
import { COOKIES_PARAM_META_KEY } from "@/common";
import { createParamMetadata } from "@/utils";

export const Cookies = (): ParameterDecorator => (target, propertyKey, index) => createParamMetadata(COOKIES_PARAM_META_KEY, index, propertyKey, target);