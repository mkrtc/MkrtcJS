import { ServerDIContainer } from "@/di/index.js";
import { headers } from "next/headers.js";

/**
 * @example
 * import { Service, Headers } from "mkrtcjs/core/server";
 * import type { NextHeaders } from "mkrtcjs/core/types";
 * 
 * *@Service()
 * class MyServerService{
 * 
 * *@Headers()
 *  private headers: Promise<NextHeaders>;
 * *@Headers("user-agent")
 *  private headers: Promise<string>;
 * *@Headers(["user-agent", "origin"])
 *  private headers: Promise<Record<string, string | null>>; // {"user-agent": "chrome", origin: "url"}
 * }    
 */
export const Headers = (prefix?: string | string[]): PropertyDecorator => (target, propertyKey) => {
    const getter = async function () {

        let _headers = ServerDIContainer.get("headers");
        if (!_headers) {
            _headers = await headers();
        }

        if (!prefix) return _headers;

        if (Array.isArray(prefix)) {
            const result: Record<string, string | null> = {};
            for (const key of prefix) {
                result[key] = _headers.get(key) ?? null;
            }
            return result;
        }
        
        return _headers.get(prefix) ?? null;
    }

    Object.defineProperty(target, propertyKey, {
        get: getter,
        configurable: true,
        enumerable: true
    })
}

/**
 * @example
 * import { Ip, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Ip()
 *  public ip: Promise<string | null>;
 * }
 */
export const Ip = (): PropertyDecorator  => Headers("x-forwarded-for");

/**
 * @example
 * import { UserAgent, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@UserAgent()
 *  public userAgent: Promise<string | null>;
 * }
 */
export const UserAgent = (): PropertyDecorator => Headers("user-agent");

/**
 * @example
 * import { Accept, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Accept()
 *  public accept: Promise<string | null>;
 * }
 */
export const Accept = (): PropertyDecorator => Headers("accept");

/**
 * @example
 * import { AcceptEncoding, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@AcceptEncoding()
 *  public acceptEncoding: Promise<string | null>;
 * }
 */
export const AcceptEncoding = (): PropertyDecorator => Headers("accept-encoding");

/**
 * @example
 * import { AcceptLanguage, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@AcceptLanguage()
 *  public acceptLanguage: Promise<string | null>;
 * }
 */
export const AcceptLanguage = (): PropertyDecorator => Headers("accept-language");

/**
 * @example
 * import { CacheControl, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@CacheControl()
 *  public cacheControl: Promise<string | null>;
 * }
 */
export const CacheControl = (): PropertyDecorator => Headers("cache-control");

/**
 * @example
 * import { Connection, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Connection()
 *  public connection: Promise<string | null>;
 * }
 */
export const Connection = (): PropertyDecorator => Headers("connection");

/**
 * @example
 * import { Origin, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Origin()
 *  public origin: Promise<string | null>;
 * }
 */
export const Origin = (): PropertyDecorator => Headers("origin");

/**
 * @example
 * import { Referer, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@Referer()
 *  public referer: Promise<string | null>;
 * }
 */
export const Referer = (): PropertyDecorator => Headers("referer");

/**
 * @example
 * import { SetCookies, Service } from "@mkrtcjs/core/server";
 * 
 * *@Service()
 * class MyService{
 *  *@SetCookies()
 *  public setCookies: Promise<string | string[] | null>;
 * }
 */
export const SetCookies = (): PropertyDecorator => Headers("set-cookie");