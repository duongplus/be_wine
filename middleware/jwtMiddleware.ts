import {Context, Status} from "https://deno.land/x/oak/mod.ts";
import {validateJwt} from "https://deno.land/x/djwt/validate.ts";
import {Response} from "../helper/response.ts"
import {key} from "../security/jwt.ts";
//Authorization: Bearer token
// export const jwtMiddleware = async (context: Context, next: any) => {
//     const headers: Headers = context.request.headers;
//     const authorization = headers.get("Authorization");
//
//     if (!authorization) {
//         return Response(context, Status.Unauthorized, {
//             message: "Invalid jwt token",
//         })
//     }
//
//     const token = authorization.split(" ")[1];
//     if (!token) {
//         return Response(context, Status.Unauthorized, {
//             message: "Invalid jwt token",
//         })
//     }
//
//     if (await validateJwt(token, key)) {
//         await next()
//         return;
//     }
//
//     return Response(context, Status.Unauthorized, {
//         message: "Invalid jwt token",
//     })
// }
