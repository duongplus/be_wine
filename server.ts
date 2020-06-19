import {Application} from "https://deno.land/x/oak/mod.ts";//https://deno.land/x/oak@v5.2.0
import apiRouter from "./router/api.ts";
const app = new Application();


app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

await app.listen({port: 8000});