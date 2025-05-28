import { ServerDIContainer } from "@/di"
import { MkrtcRequest, NextCookies, NextHeaders } from "@/types";
import { cookies, headers } from "next/headers";

/**
 * @example
 * import { Service, Req } from "@mkrtcjs/core/server";
 * import type { MkrtcRequest, NextHeaders } from "@mkrtcjs/core/types";
 * 
 * *@Service()
 * class MyService{
 *  *@Req()
 *  public req: Promise<MkrtcRequest>;
 *  *@Req("headers")
 *  public req: Promise<NextHeaders>;
 *  *@Req(["host", "url"])
 *  public req: Promise<{host: string, url: string}>;
 * }
 */
export const Req = (key?: keyof MkrtcRequest | (keyof MkrtcRequest)[]): PropertyDecorator => (target, propertyKey) => {
    const getter = async function () {
        const _headers = await headers();
        const _cookies = await cookies();

        const referer = _headers.get("referer");
        const url: URL | null = referer ? new URL(referer) : null;
        const _req = {
            headers: _headers,
            cookies: _cookies,
            host: _headers.get("host") || "",
            ip: _headers.get("x-forwarded-for") || "",
            url: url,
            port: Number(url?.port) || null,
            path: url?.pathname || null,
            queryParams: url?.searchParams || null,
        }

        if (Array.isArray(key)) {
            return key.reduce<Record<string, any>>((acc, curr) => {
                if (!_req) return acc;

                acc[curr] = _req[curr];
                return acc;
            }, {});
        }

        if (key) {
            return _req[key];
        }

        return _req;
    }

    Object.defineProperty(target, propertyKey, {
        get: getter,
        configurable: true,
        enumerable: true
    });
}

/**
 * @example
 * import { Service, Path } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Path()
 *  public path: Promise<string>;
 * }
 */
export const Path = (): PropertyDecorator => Req("path");
/**
 * @example
 * import { Service, Host } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Host()
 *  public path: Promise<string>;
 * }
 */
export const Host = (): PropertyDecorator => Req("host");
/**
 * @example
 * import { Service, Port } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Port()
 *  public path: Promise<number | null>;
 * }
 */
export const Port = (): PropertyDecorator => Req("port");
/**
 * @example
 * import { Service, Url } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Url()
 *  public path: Promise<URL>;
 * }
 */
export const Url = (): PropertyDecorator => Req("url");
/**
 * @example
 * import { Service, QueryParams } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@QueryParams()
 *  public path: Promise<URLSearchParams | null>;
 * }
 */
export const QueryParams = (): PropertyDecorator => Req("queryParams");