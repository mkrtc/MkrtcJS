import type { NextCookies, NextHeaders } from "../server/index.js";

export interface MkrtcRequest{
    url: URL | null;
    queryParams: URLSearchParams | null;
    cookies: NextCookies;
    headers: NextHeaders;
    path: string | null;
    port: number | null;
    host: string | null;
    ip: string | null;
}