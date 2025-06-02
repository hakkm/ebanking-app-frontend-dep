import {Role} from './role.model';

export interface User {
  username: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  referralCode?: string;
  referredBy?: string;
  bonusBalance?: number;
}

