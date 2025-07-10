import { cookies, headers } from "next/headers.js";

export type NextHeaders = Awaited<ReturnType<typeof headers>>;
export type NextCookies = Awaited<ReturnType<typeof cookies>>; 