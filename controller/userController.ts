import {Context, Status, STATUS_TEXT} from "https://deno.land/x/oak/mod.ts";
import Db from "../db/database.ts";
import {changePassword, saveUser, selectUserByPhone} from "../repository/userRepo.ts";
import {Response} from "../helper/Response.ts"
import {encryptPass, verifyPass} from "../security/pass.ts";
import {ROLE, User} from "../model/user.ts";
import {genToken} from "../security/jwt.ts";
import {fetchPayload} from "../helper/token.ts";

export const signInHandler = async (context: Context) => {
    const body = await context.request.body()
    const reqData = body.value

    //verify phone
    const user: User = await selectUserByPhone(reqData.phone);
    if (!user) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound)
        })
    }

    //verify pass
    const passIsValid = verifyPass(reqData.password, user.password);
    if (!passIsValid) {
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: STATUS_TEXT.get(Status.Unauthorized)
        })
    }

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: {
            displayName: user.displayName,
            token: genToken({
                phone: user.phone,
            })
        }
    })
}

export const signUpHandler = async (context: Context) => {
    const body = await context.request.body()
    const reqData = body.value

    let user = await selectUserByPhone(reqData.phone)
    if (user) {
        return Response(context, Status.Conflict, {
            status: Status.Conflict,
            message: STATUS_TEXT.get(Status.Conflict)
        })
    }
    reqData.role = ROLE.MEMBER;
    reqData.point = 0;
    reqData.password = encryptPass(reqData.password);
    if (reqData.phone == "0933505575") {
        reqData.role = ROLE.ADMIN
    }
    const insertId = await saveUser(reqData);

    if (!insertId) {
        console.log("insertId")
        return Response(context, Status.InternalServerError, {
            status: Status.InternalServerError,
            message: STATUS_TEXT.get(Status.InternalServerError)
        })
    }
    user = reqData;
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: {
            displayName: user.displayName,
            role: user.role,
            avatar: user.avatar,
            point: user.point,
            token: genToken({
                phone: user.phone,
            })
        }
    })

}

export const profileHandler = async (context: Context) => {
    const payload = await fetchPayload(context);

    const user: User = await selectUserByPhone(payload?.phone);
    if (!user) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound)
        })
    }
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: {
            displayName: user.displayName,
            point: user.role,
            role: user.role,
            avatar: user.avatar,
        }
    })
}

export const checkAdminHandler = async (context: Context) => {
    const payload = await fetchPayload(context);

    const user: User = await selectUserByPhone(payload?.phone);
    if (!user) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound)
        })
    }

    if (user.role == ROLE.ADMIN) {
        return Response(context, Status.OK, {
            status: Status.OK,
            message: STATUS_TEXT.get(Status.OK),
            data: {
                displayName: user.displayName,
                role: user.role,
                avatar: user.avatar,
            }
        })
    }

    return Response(context, Status.Unauthorized, {
        status: Status.Unauthorized,
        message: "you are not admin"
    })
}

export const changePasswordHandler = async (context: Context) => {
    const body = await context.request.body()
    const reqData = body.value
    const payload = await fetchPayload(context);
    const user: User = await selectUserByPhone(payload?.phone);
    console.log(payload?.phone)
    //verify pass
    const passIsValid = verifyPass(reqData.password, user.password);
    console.log(passIsValid)
    if (!passIsValid) {
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: STATUS_TEXT.get(Status.Unauthorized)
        })
    }
    console.log(reqData.password)
    console.log(reqData.newPass)
    reqData.newPass = encryptPass(reqData.newPass);
    const isChanged = changePassword(payload?.phone, reqData.newPass);
    if (!isChanged) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound)
        })
    }

    return Response(context, Status.OK, {
        status: Status.OK,
        message: "OK"
    })

}