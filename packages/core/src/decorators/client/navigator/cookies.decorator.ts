import "reflect-metadata";
import { COOKIES_PARAM_META_KEY } from "@/common/index.js";
import { createParamMetadata } from "@/utils/index.js";

export const Cookies = (): ParameterDecorator => (target, propertyKey, index) => createParamMetadata(COOKIES_PARAM_META_KEY, index, propertyKey, target);