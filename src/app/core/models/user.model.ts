import {Role} from './role.model';

export interface User {
  username: string;
  password: string;
  email: string;
  role: Role;
  phone: string
}
