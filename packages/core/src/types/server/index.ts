import { cookies, headers } from "next/headers";

export type NextHeaders = Awaited<ReturnType<typeof headers>>;
export type NextCookies = Awaited<ReturnType<typeof cookies>>; 