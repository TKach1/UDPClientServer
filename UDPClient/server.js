var udp = require("dgram");

var buffer = require("buffer");

var fs = require("fs");

// creating a client socket
var client = udp.createSocket("udp4");

const finalFile = {
  data: "",
  name: "",
  hash: "",
};
//buffer msg
var data = Buffer.from("image.png");

client.on("message", function (msg, info) {
  console.log("Data received from server");
  if (msg.toString().slice(0, 3) == "404") {
    console.log("Data received from server : " + msg.toString());
    console.log("dasd");
    return;
  }

  if (finalFile.name == "") {
    const t = msg.toString().split(":");
    finalFile.name = t[0];
    finalFile.hash = t[1];
  } else {
    finalFile.data += msg.toString();
  }
  console.log("Data received from server : " + msg.toString());
  console.log(
    "Received %d bytes from %s:%d\n",
    msg.length,
    info.address,
    info.port,
  );

  console.log(finalFile.name);

  if (msg.toString().endsWith("FINAL")) {
    finalFile.data = finalFile.data.replace("FINAL", "");
    createFile();
  }
});

function createFile() {
  fs.writeFile(finalFile.name, finalFile.data, function (err) {
    if (err) console.log("ERROR");
    console.log("SALVO");
  });
}

client.send(data, 41337, "localhost", function (error) {
  if (error) {
    client.close();
  } else {
    console.log("Data sent !!");
  }
});
