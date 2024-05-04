const fs = require("fs");
const http = require("http");
const url = require("url");

const replaceTemplate = require("./modules/replaceTemplate");

//! 3 synchronous functions below CANNOT be called insude createServer callback function
const templateOverview = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  "utf-8",
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/card.html`,
  "utf-8",
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  "utf-8",
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const server = http.createServer((request, response) => {
  const { query, pathname } = url.parse(request.url, true);

  if (pathname === "/" || pathname === "/overview") {
    response.writeHead(200, {
      "Content-Type": "text/html",
    });

    const cardsHTML = dataObj
      .map((element) => replaceTemplate(templateCard, element))
      .join("");
    const output = templateOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHTML);

    response.end(output);
  } else if (pathname === "/product") {
    response.writeHead(200, {
      "Content-Type": "text/html",
    });

    const product = dataObj[query.id];
    const output = replaceTemplate(templateProduct, product);

    response.end(output);
  } else if (pathname === "/api") {
    response.writeHead(200, {
      "Content-Type": "application/json",
    });

    response.end(data);
  } else {
    response.writeHead(404, {
      "Content-Type": "text/html",
      "my-own-header": "hello world",
    });

    response.end("<h1>Page not found :(</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on port 8000");
});
