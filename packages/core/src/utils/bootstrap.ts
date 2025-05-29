import { NextRequest, NextResponse } from "next/server";


export const bootstrap = async (req: NextRequest) => {
    const response = NextResponse.next();
    response.headers.set("x-next-url", req.nextUrl.href);

    return response;
}