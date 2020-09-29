import Db from "../db/database.ts";
import {Wine} from "../model/wine.ts";

const wineCollection = Db.collection("wines");

export const saveWine = async (wine: Wine) => {
    return await wineCollection.insertOne(wine);
};

export const checkWineExist = async (wine: Wine) => {
    return wineCollection.findOne({
        name: wine.name,
        producer: wine.producer,
        alcohol: wine.alcohol,
    })
}

export const updateCapacityWine = async (wineId: any, capacity: number) => {
    return await wineCollection.updateOne({
        _id: {$oid: wineId}
    }, {
        $inc: {capacity: capacity}
    })
}

export const selectWineById = async (wineId: string) => {
    return await wineCollection.findOne({
        _id: {
            "$oid": wineId,
        },
    });
};

export const selectWineByCateId = async (cateId: string) => {
    return await wineCollection.find({
        cateID: cateId,
    });
};

export const updateCapacityWineById = async (wineId: any, amount: number) => {
    return await wineCollection.updateOne({
        _id: {
            $oid: wineId,
        }
    }, {
        $inc: {
            capacity: amount
        }
    })
}

export const updateWine = async (wineId: any, wine: Wine) => {
    return await wineCollection.updateOne({
        _id: {
            $oid: wineId,
        }
    }, {
        $set: {
            name: wine.name,
            producer: wine.producer,
            country: wine.country,
            alcohol: wine.alcohol,
            description: wine.description,
            thumbnail: wine.thumbnail,
            price: wine.price,
            cateID: wine.cateID,
            capacity: wine.capacity,
            size: wine.size,
        }
    })
}