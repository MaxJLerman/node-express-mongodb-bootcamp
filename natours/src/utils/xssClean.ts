import { Request, Response, NextFunction } from "express";

import clean from "@lib/xss";

const xssClean = () => {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (request.body) request.body = clean(request.body);
    // @ts-ignore
    if (request.query) request.query = clean(request.query); //! return later
    // @ts-ignore
    if (request.params) request.params = clean(request.params); //! return later

    next();
  };
};

export default xssClean;

// TODO: adapt code to below example
/*
interface RequestParams {}

interface ResponseBody {}

interface RequestBody {}

interface RequestQuery {
  foo: string;
}

function getHandler(
  request: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>,
  response: Response
) {
  const { query } = request;

  query.foo; // string
}
*/
