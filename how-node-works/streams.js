const fs = require("fs");
const server = require("http").createServer();

server.on("request", (req, res) => {
  //! solution 1 - node loads entire file into memory then sends to client
  // fs.readFile("test-file.txt", (err, data) => {
  //   if (err) console.log(err);
  //   res.end(data);
  // });

  //? solution 2 - create readable stream, then when its available send each chunk of data to client in response (writable stream)
  // const readable = fs.createReadStream("test-file.txt");
  // readable.on("data", (chunk) => {
  //   res.write(chunk);
  // });
  // readable.on("end", () => {
  //   res.end();
  // });
  // readable.on("error", (err) => {
  //   console.log(err);
  //   res.statusCode = 500;
  //   res.end("File not found");
  // });

  //* solution 3 - pipe operator, pipes output of readable stream to input of writeable stream
  const readable = fs.createReadStream("test-file.txt");
  readable.pipe(res);
  /**
   * @param readable is a readable source
   * @param res is the writeable destination
   */
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening...");
});
