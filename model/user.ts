export interface User {
    // _id: {$oid: string};
    displayName: string;
    avatar: string;
    phone: string;
    password: string;
    point: number;
    role: string;
}

export enum ROLE {
    MEMBER = "MEMBER",
    ADMIN = "ADMIN"
}