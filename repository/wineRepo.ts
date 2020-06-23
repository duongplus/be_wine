import Db from "../db/database.ts";
import {Wine} from "../model/wine.ts";

const wineCollection = Db.collection("wines");

export const saveWine = async (wine: Wine) => {
    return await wineCollection.insertOne(wine);
};

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
