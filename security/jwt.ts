import {validateJwt} from "https://deno.land/x/djwt@v0.9.0/validate.ts";
import {makeJwt, Jose, Payload} from "https://deno.land/x/djwt/create.ts";

export const key = "abcdefgh123456"

const header: Jose = {
    alg: "HS256",
    typ: "JWT"
};

export const genToken = (payload: Payload) => {
    return makeJwt({header, payload, key})
}

export const validateToken = async (token: string) => {
    return await validateJwt(token, key, {isThrowing: false});
}