import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<any>;

const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
  return (request: Request, response: Response, next: NextFunction) => {
    fn(request, response, next).catch(next);
  };
};

export default catchAsync;
