import {Context} from "https://deno.land/x/oak/mod.ts";
import {validateJwt} from "https://deno.land/x/djwt@v0.9.0/validate.ts";
import {key} from "../security/jwt.ts";

export const fetchPayload = async (context: Context) => {
    const token = await parseToken(context);
    const data = await validateJwt(token, key,{isThrowing: false});
    return data ? data.payload : null;
}

export const parseToken = async (context: Context) => {
    const headers: Headers = context.request.headers;
    const authorization = headers.get("Authorization");

    if (!authorization) {
        return "";
    }

    const token = authorization.split(" ")[1];
    if (!token) {
        return "";
    }

    return token;
}