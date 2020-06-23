import {Context, Status} from "https://deno.land/x/oak/mod.ts";
import {validateJwt} from "https://deno.land/x/djwt@v0.9.0/validate.ts";
import {key} from "../security/jwt.ts";
import {Response} from "../helper/Response.ts"
import {fetchPayload} from "../helper/token.ts";
import {ROLE, User} from "../model/user.ts";
import {selectUserByPhone} from "../repository/userRepo.ts";
//Authorization: Bearer token
export const jwtMidCheckAdmin = async (context: Context, next: any) => {
    const headers: Headers = context.request.headers;
    const authorization = headers.get("Authorization");

    if (!authorization) {
        return Response(context, Status.Unauthorized, {
            message: "No admin",
        })
    }

    const token = authorization.split(" ")[1];
    if (!token) {
        return Response(context, Status.Unauthorized, {
            message: "No admin",
        })
    }
    if (await validateJwt(token, key, {isThrowing: false})) {
        const payload = await fetchPayload(context);
        const user: User = await selectUserByPhone(payload?.phone);
        if (!user) {
            return Response(context, Status.Unauthorized, {
                message: "No admin",
            })
        }
        if (user.role != ROLE.ADMIN) {
            return Response(context, Status.Unauthorized, {
                message: "No admin",
            })
        }
        await next()
        return;
    }

    return Response(context, Status.Unauthorized, {
        message: "No admin",
    })
}
