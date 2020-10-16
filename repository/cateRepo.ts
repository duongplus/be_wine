import Db from "../db/database.ts";

const cateCollection = Db.collection("cates");

export const saveCate = async (cate: string) => {
    let category = {cateName:cate};
    return await cateCollection.insertOne(category);
};

export const findCate = async () => {
    return await cateCollection.find();
}