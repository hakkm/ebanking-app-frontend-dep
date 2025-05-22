import { Role } from "./role.model";

export interface Agent {
  email: string;
  password: string;
  name: string;
  role: Role;
}