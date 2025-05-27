"use server"
import { ServerDIContainer } from "@/di"
import { cookies } from "next/headers"

/**
 * @example
 * import { Cookies, Service } from "@mkrtcjs/core/server";
 * import type { NextCookies } from "@mkrtcjs/core/type";
 * 
 * *@Service()
 * export class MyService {
 *  *@Cookies()
 *  public cookies: NextCookies;
 *  
 * *@Cookies("token")
 *  public cookies: Promise<string | string[] | null>;
 * 
 * *@Cookies(["language", "theme"])
 *  public cookies: Promise<string | string[] | null>;
 * }
 */
export const Cookies = (key?: string | string[]): PropertyDecorator => (target, propertyKey) => {
    const getter = async function () {
        let _cookies = ServerDIContainer.cookies;
        if (!_cookies) {
            _cookies = await cookies();
        }
        if (!key) return _cookies;

        if (Array.isArray(key)) {
            const result: Record<string, string | null> = {};
            for (const k of key) {
                result[k] = _cookies.get(k)?.value || null;
            }
            return result;
        }

        return _cookies.get(key)?.value;
    }

    Object.defineProperty(target, propertyKey, {
        get: getter,
        configurable: true,
        enumerable: true
    });
}