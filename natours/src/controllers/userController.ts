import { Request, Response, NextFunction } from "express";

import User from "@models/userModel";
import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "@controllers/handlerFactory";

const filterObject = (object: object, ...allowedFields: string[]) => {
  const newObject = {};

  //? loops through all fields, check if it's in allowedFields, if it is then create new field in new object with same value from original object
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) {
      // @ts-ignore
      newObject[element] = object[element]; //! return later
    }
  });

  return newObject;
};

export const getCurrentUser = (
  request: Request,
  _response: Response,
  next: NextFunction,
) => {
  request.params["id"] = (request as any).user.id; //! return later

  next();
};

export const updateCurrentUser = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    //* create error if user POSTs password data
    if (request.body.password || request.body.confirmPassword) {
      return next(
        new AppError(
          "This route is not for password updates. Use /update-password instead.",
          400,
        ),
      );
    }

    //* filtered out unwanted field names from request body that aren't allowed to be updated
    const filteredBody = filterObject(request.body, "name", "email");

    //* update user document
    const updatedUser = await User.findByIdAndUpdate(
      (request as any).user.id, //! return later
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    );

    response.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  },
);

export const deleteCurrentUser = catchAsync(
  async (request: Request, response: Response, _next: NextFunction) => {
    await User.findByIdAndUpdate(
      (request as any).user.id, //! return later
      { active: false },
    );

    response.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export const createUser = (_request: Request, response: Response) => {
  response.status(500).json({
    status: "error",
    message: "route not defined, cheeky bugger",
  });
};

export const getAllUsers = getAll(User);
export const getOneUser = getOne(User);
export const updateUser = updateOne(User); //! DO NOT UPDATE PASSWORDS WITH THIS
export const deleteUser = deleteOne(User);
