import { Request, Response, NextFunction } from "express";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "@models/userModel";
import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import sendEmail from "@utils/email";
import { IUser, RoleOptions, UserDocument } from "@schemas/user.schema";

const signToken = (id: string | number): string => {
  const token = jwt.sign({ id }, process.env["JWT_SECRET"]!, {
    expiresIn: process.env["JWT_EXPIRES_IN"],
  });

  return token;
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  response: Response,
) => {
  const token = signToken(user._id as string);

  response.cookie("JWT", token, {
    expires: new Date(
      Date.now() +
        parseInt(process.env["JWT_COOKIE_EXPIRES_IN"] as string, 10) *
          24 *
          60 *
          60 *
          1000,
    ),
    secure: process.env["NODE_ENV"] === "production",
    httpOnly: true,
  });

  user.password = undefined; //? removes password from output

  response.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(
  async (request: Request, response: Response, _next: NextFunction) => {
    const { name, email, role, password, confirmPassword, passwordChangedAt } =
      request.body;

    const newUser = await User.create({
      name,
      email,
      role,
      password,
      confirmPassword,
      passwordChangedAt,
    });

    createSendToken(newUser, 201, response);
  },
);

export const login = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return next(
        new AppError("A user must provide an email and password", 400),
      );
    }

    const user = await User.findOne({ email }).select("+password");

    //? if there is no user, 2nd half of IF statement won't be checked & function is skipped
    // @ts-ignore //! revisit later
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    createSendToken(user, 200, response);
  },
);

export const protect = catchAsync(
  async (request: Request, _response: Response, next: NextFunction) => {
    //* grab token, check if it exists
    let token;
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith("Bearer")
    ) {
      token = request.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("User not logged in", 401));
    }

    //* verify token integrity
    const decodedData = await promisify(jwt.verify)(
      token,
      // @ts-ignore //! revisit later
      process.env["JWT_SECRET"],
    );

    //* check if user still exists
    const currentUser: UserDocument | null = await User.findById(
      (decodedData as any).id, //! return later
    );
    if (!currentUser) {
      return next(
        new AppError("User belonging to this token no longer exists", 401),
      );
    }

    //* checks if user has changed their password after the token was issued
    if (
      currentUser.changedPasswordAfter((decodedData as any).iat) //! return later
    ) {
      return next(
        new AppError(
          "User recently changed password, try logging in again",
          401,
        ),
      );
    }

    //* now grant access to protected route
    (request as any).user = currentUser; //! return later
    next();
  },
);

//? at least one role must be provided, but also allows for additional roles
export const restrictTo = (...roles: RoleOptions[]) => {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (
      !roles.includes((request as any).user.role) //! return later
    ) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const user: UserDocument | null = await User.findOne({
      email: request.body.email,
    });
    if (!user) {
      return next(new AppError("There is no user with this email", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${request.protocol}://${request.get(
      "host",
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Sumbit a PATCH request with your new password + confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 minutes)",
        message,
      });

      response.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError("Something broke and we couldn't send that email", 500),
      );
    }
  },
);

export const resetPassword = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    //* get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(request.params["token"] as crypto.BinaryLike)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    //* if token not expired & there is a user, set new password
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = request.body.password;
    user.confirmPassword = request.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //* update changedPasswordAt property for user

    //* log user in, send JWT to user
    createSendToken(user, 200, response);
  },
);

export const updatePassword = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    //* get user from collection
    const user: UserDocument | null = await User.findById(
      (request as any).user.id, //! return later
    ).select("+password"); //? include password select as it is not included in the response by default

    if (user !== null) {
      //* check if POSTed current password is correct
      if (
        !(await user.correctPassword(
          request.body.currentPassword,
          user.password as string,
        ))
      ) {
        return next(new AppError("Your current password is wrong.", 401));
      }

      //* if so, update password
      user.password = request.body.password;
      user.confirmPassword = request.body.confirmPassword;
      await user.save();

      //* log user in, send JWT to user
      createSendToken(user, 200, response);
    }
  },
);
