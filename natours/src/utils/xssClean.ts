import { Request, Response, NextFunction } from "express";

import clean from "@lib/xss";

function xxsClean() {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (request.body) request.body = clean(request.body);
    if (request.query) request.query = clean(request.query);
    if (request.params) request.params = clean(request.params);

    next();
  };
}

export default xxsClean;

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
