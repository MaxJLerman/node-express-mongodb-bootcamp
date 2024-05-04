const fs = require("fs");
const http = require("http");

const replaceTemplate = (template, product) => {
  let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  }

  return output;
};

//! 3 synchronous functions below cannot be called insude createServer callback function
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
  const pathname = request.url;

  if (pathname === "/" || pathname === "/overview") {
    response.writeHead(200, {
      "Content-Type": "text/html",
    });

    const cardsHTML = dataObj
      .map((element) => replaceTemplate(templateCard, element))
      .join("");

    const output = templateOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHTML);
    response.end(output);
  } else if (pathname === "/products") {
    response.end("This is the products");
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
