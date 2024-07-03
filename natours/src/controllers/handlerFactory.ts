import { Model, PopulateOptions, Document } from "mongoose";
import { Request, Response, NextFunction } from "express";

import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import APIFeatures from "@utils/apiFeatures";

export const deleteOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      const document = await Model.findByIdAndDelete(request.params["id"]);

      if (!document) {
        return next(new AppError("No document found with that ID", 404));
      }

      response.status(204).json({
        status: "success",
        data: null,
      });
    },
  );

export const updateOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      const document = await Model.findByIdAndUpdate(
        request.params["id"],
        request.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!document) {
        return next(new AppError("No document found with that ID", 404));
      }

      response.status(200).json({
        status: "success",
        data: {
          data: document,
        },
      });
    },
  );

export const createOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(
    async (request: Request, response: Response, _next: NextFunction) => {
      const document = await Model.create(request.body);

      response.status(201).json({
        status: "success",
        data: {
          data: document,
        },
      });
    },
  );

export const getOne = <T extends Document>(
  Model: Model<T>,
  populateOptions?: PopulateOptions | (string | PopulateOptions)[],
) =>
  catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      let query = Model.findById(request.params["id"]);
      if (populateOptions) {
        query = query.populate(populateOptions);
      }
      const document = await query;

      if (!document) {
        return next(new AppError("No document found with that ID", 404));
      }

      response.status(200).json({
        status: "success",
        data: {
          data: document,
        },
      });
    },
  );

export const getAll = <T extends Document>(Model: Model<T>) =>
  catchAsync(
    async (request: Request, response: Response, _next: NextFunction) => {
      //* allows for nested get reviews on tour (hack)
      let filter = {}; //? base filter, finds all tours

      if (request.params["tourId"]) {
        filter = { tour: request.params["tourId"] }; //? filters out all tours that don't match the tourId (if provided)
      }

      const features = new APIFeatures(Model.find(filter), request.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      // const documents = await features.query.explain();
      const documents = await features.query;

      response.status(200).json({
        status: "success",
        // requestedAt: request.requestTime, //! requestTime doesn't exist on Express type Request
        results: documents.length,
        data: {
          data: documents,
        },
      });
    },
  );
