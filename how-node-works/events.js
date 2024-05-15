const EventEmitter = require("events");
const http = require("http");

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

myEmitter.on("newSale", () => {
  console.log("New sale");
});

myEmitter.on("newSale", () => {
  console.log("Customer");
});

myEmitter.on("newSale", (stock) => {
  console.log(`There are now ${stock} items left in stock`);
});

myEmitter.emit("newSale", 9);

////////////////////////////////////////////////////////

const server = http.createServer();

server.on("request", (request, response) => {
  console.log("request received");
  console.log(request.url);
  response.end("request received");
});

server.on("request", (request, response) => {
  console.log("another request");
});

server.on("close", () => {
  console.log("Server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("waiting for requests...");
});
