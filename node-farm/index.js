const http = require("http");

const server = http.createServer((req, res) => {
  const pathname = req.url;

  if (pathname === "/" || pathname === "/overview") {
    res.end("This is the overview");
  } else if (pathname === "/products") {
    res.end("This is the products");
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
      "my-own-header": "hello world",
    });
    res.end("<h1>Page not found :(</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on port 8000");
});
