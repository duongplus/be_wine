import {Context, Status} from "https://deno.land/x/oak/mod.ts";

export const Response = (context: Context, status: Status, data: any) => {
    context.response.status = status;
    context.response.body = data;
}