const dgram = require("node:dgram");
const server = dgram.createSocket("udp4");
const fs = require("fs");
const buffer = require("buffer");
var crypto = require("crypto");

const byteSize = (str) => new Blob([str]).size;

const BUFFER = 8000;

server.on("error", (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

  fs.readFile(msg, function (err, data) {
    if (err) server.send("404 - File not found", rinfo.port, rinfo.address);
    else {
      data = Buffer.from(data);
	  console.log(new Int8Array(data));
      const a = ~~(data.length / BUFFER + 1);
      //const packetSize = data.toString().length / a;
      //const re = new RegExp("(.|[\\r\\n]){1," + ~~packetSize + "}", "g");
      //const dataSanitized = data.toString().match(re).forEach((d) => {return Buffer.from(d)});
      let dataSanitized = [];
      for(let i = 0; i < a; i++){
          dataSanitized.push(data.subarray(BUFFER*i, BUFFER*(i+1)));
      }
      const checksum = generateChecksum(data);
      console.log(checksum);

      server.send(msg + ":" + checksum, rinfo.port, rinfo.address);
      let i = 1;
      dataSanitized.forEach((d) => {
        server.send(new Int8Array(d), rinfo.port, rinfo.address);
        console.log(i+ "/" +dataSanitized.length);
        i++;
      });
      server.send("FINAL", rinfo.port, rinfo.address);
    }
    console.log(`server sent: ` + msg);
  });
});

server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41337);
// Prints: server listening 0.0.0.0:41234

function generateChecksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || "md5")
    .update(str, "utf8")
    .digest(encoding || "hex");
}
