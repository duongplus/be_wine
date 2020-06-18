import {Context, Status, STATUS_TEXT} from "https://deno.land/x/oak/mod.ts";
import Db from "../db/database.ts";
import {saveUser, selectUserByPhone} from "../repository/userRepo.ts";
import {Response} from "../helper/Response.ts"
import {encryptPass, verifyPass} from "../security/pass.ts";
import {User} from "../model/user.ts";

const testCollection = Db.collection("test");
export const testApiHandler = async (context: Context) => {
    // insert
    const insertId = await testCollection.insertOne({
        username: "user1",
        password: "pass1",
    });

    console.log(insertId);

    context.response.status = Status.OK;
    context.response.body = "Test Handler!";
}

export const signInHandler = async (context: Context) => {
    const body = await context.request.body()
    const reqData = body.value

    //verify phone
    const user: User = await selectUserByPhone(reqData.phone);
    if(!user) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound)
        })
    }

    //verify pass
    const passIsValid = verifyPass(reqData.password, user.password);
    if(!passIsValid){
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: STATUS_TEXT.get(Status.Unauthorized)
        })
    }

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK)
    })
}

export const signUpHandler = async (context: Context) => {
    const body = await context.request.body()
    const reqData = body.value

    const user = await selectUserByPhone(reqData.phone)
    if (user) {
        return Response(context, Status.Conflict, {
            status: Status.Conflict,
            message: STATUS_TEXT.get(Status.Conflict)
        })
    }

    reqData.password = encryptPass(reqData.password);
    const insertId = await saveUser(reqData);

    if (!insertId) {
        return Response(context, Status.InternalServerError, {
            status: Status.InternalServerError,
            message: STATUS_TEXT.get(Status.InternalServerError)
        })
    }


    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK)
    })

}

