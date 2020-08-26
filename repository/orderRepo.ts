import Db from "../db/database.ts";
import {Order, OrderInfo, OrderStatus} from "../model/order.ts";
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

export const addWineToOrder = async (orderInfo: OrderInfo, phone: any) => {
    return await orderCollection.updateOne({
        phone: phone, status: OrderStatus.PENDING
    }, {
        $push: {
            "wines": {orderInfo}
        }
    })
}

export const addMoreWineToOrder = async (phone: any, index: number, wines: OrderInfo[]) => {
    // const query = "wines."+index+".orderInfo.amount:1";
    // @ts-ignore
    wines[index]["orderInfo"].amount += 1;
    return await orderCollection.updateOne({
            phone: phone, status: OrderStatus.PENDING
        },
        {
            $set: {
                wines: wines
            }
        })
}

export const minusWineFromOrder = async (phone: any, index: number, wines: OrderInfo[]) => {
    // @ts-ignore
    const amount = wines[index]["orderInfo"].amount -= 1;
    if (amount > 0) {
        return await orderCollection.updateOne({
                phone: phone, status: OrderStatus.PENDING
            },
            {
                $set: {
                    wines: wines
                }
            })
    }
    wines.splice(index, 1);
    return await orderCollection.updateOne({
            phone: phone, status: OrderStatus.PENDING
        },
        {
            $set: {
                wines: wines
            }
        });
}

export const checkWineExist = async (phone: any, wineId: any) => {
    return await orderCollection.find({
        phone: phone,
    });
};

export const updateOrderStatus = async (phone: any, total: number) => {
    const date: Date = new Date();
    return await orderCollection.updateOne({
        phone: phone, status: OrderStatus.PENDING,
    }, {
        phone: phone,
        total: total,
        date: date,
        status: OrderStatus.CONFIRM,
    });
};