import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {testApiHandler} from "../controller/userController.ts";

const router = new Router();
router
    .get("/api/test", testApiHandler);

export default router;