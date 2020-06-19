import { MongoClient } from "https://deno.land/x/mongo@v0.7.0/mod.ts";
//renduong - Renduong1
//$PROJECT_DIR$/Makefile
//mingw32-make run
const client = new MongoClient();
client.connectWithUri("mongodb+srv://renduong:Renduong1@cluster0-p6zwk.mongodb.net/duong_wine?retryWrites=true&w=majority");

// // Defining schema interface
// interface UserSchema {
//     _id: { $oid: string };
//     username: string;
//     password: string;
// };

const db = client.database("duong_wine");

export default db;