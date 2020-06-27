import Db from "../db/database.ts";
import {Order, OrderStatus} from "../model/order.ts";
import {Wine} from "../model/wine.ts";

const orderCollection = Db.collection("orders");

export const selectOrderByPhone = async (phone: any) => {
    return await orderCollection.findOne({
        phone: phone,
        status: OrderStatus.PENDING
    })
}

export const createOrder = async (order: Order) => {
    return await orderCollection.insertOne(order);
}

export const addWineToOrder = async (wine: Wine, phone: any) => {
    return await orderCollection.updateOne({
        phone: phone
    }, {
        $push: {
            "wines": wine
        }
    })
}

export const checkWineExist = async (wineId:string, phone: any) => {
    return await orderCollection.find({
        phone: phone,
        wines: {
            $in: [wineId]
        }
    })

}

export const updateOrderStatus = async (phone: any) => {
    return await orderCollection.updateOne({
        phone: phone,
    }, {
        status: OrderStatus.CONFIRM,
    });
};