const clean = require("../lib/xss");

module.exports = function () {
  return (request, response, next) => {
    if (request.body) request.body = clean(request.body);
    if (request.query) request.query = clean(request.query);
    if (request.params) request.params = clean(request.params);

    next();
  };
};
