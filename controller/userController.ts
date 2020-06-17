import {Context, Status} from "https://deno.land/x/oak/mod.ts";
import Db from "../db/database.ts";

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

