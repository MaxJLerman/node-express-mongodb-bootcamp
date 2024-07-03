import { Document, Model } from "mongoose";

export type RoleOptions = "user" | "guide" | "lead-guide" | "admin";

export interface IUser extends Document {
  _id?: string;
  name: string;
  email: string;
  photo?: string;
  role?: RoleOptions;
  password: string | undefined;
  confirmPassword: string | undefined;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active?: boolean;
}

export interface IUserMethods {
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
  changedPasswordAfter(jwtTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

//* used type because User model uses instance methods
export type UserModel = Model<IUser, {}, IUserMethods>;

export type UserDocument = Document<unknown, {}, IUser> &
  IUser &
  IUserMethods & { _id: string };
