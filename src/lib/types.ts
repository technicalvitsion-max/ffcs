export type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  hours: number;
  registrationNumber: string;
  role: Role;
};

export enum Role {
  ADMIN = "admin",
  STUDENT = "student",
}

export interface Student {
  email: string;
  hours: number;
  mobile: string;
  name: string;
  registrationNumber: string;
  id: string;
}
export interface HourRequest {
  status: string;
  id: string;
  name: string;
  registrationNumber: string;
  workType: string;
  workSlab: string;
  workName: string;
  description: string;
  hours: number;
  date: string;
  proof: {
    url: string;
    path: string;
  };
  submitted: string;
  approved?: string;
  rejected?: string;
}
export interface HourRequestInput {
  workName: string;
  workSlab: string;
  workType: string;
  description: string;
  date: string;
  hours: number;
  file: File | null;
}
export enum AlertType {
  DANGER = "danger",
  SUCCESS = "success",
  WARNING = "warning",
}
