import { Role } from "./role.model";

export interface Client{
    id:number;
    username: string;
    email: string;
    role: Role;
    phone: string,
    createTime: string
}