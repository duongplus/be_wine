import Db from "../db/database.ts";
import {User} from "../model/user.ts";

const userCollection = Db.collection("users");

export const saveUser = async (user: User) => {
    return await userCollection.insertOne(user);
}

export const selectUserByPhone = async (phone: any) => {
    return await userCollection.findOne({
        phone: phone,
    });
}

export const changePassword = async (phone: any, pass: string) => {
    return await userCollection.updateOne({
            phone: phone
        },
        {
            $set: {
                password: pass
            }
        })
}

export const changeDisplayName = async (phone: any, name: string) => {
    return await userCollection.updateOne({
            phone: phone
        },
        {
            $set: {
                displayName: name
            }
        })
}

export const updatePointMember = async (phone: any, point: number) => {
    return await userCollection.updateOne({
        phone:phone,
    }, {
        $inc: {
            point: point
        }
    })
}

export const findAllUser = async () =>{
    return userCollection.find();
}

export const passwordRecovery = async (phone: any, password: string) => {
    return await userCollection.updateOne({
            phone: phone
        },
        {
            $set: {
                password: password
            }
        })
}