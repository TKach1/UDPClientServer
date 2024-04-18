var udp = require("dgram");

var buffer = require("buffer");

var fs = require("fs");

var crypto = require("crypto");

var client = udp.createSocket("udp4");

var erro = true; //variável de erro

const IP = "localhost";

let finalFile = {
  data: [],
  name: "",
  hash: "",
};


var data = Buffer.from("cr7.jpg");

client.on("message", function (msg, info) {
  //console.log("Data received from server");
  if (msg.toString().slice(0, 3) == "404") {
    console.log("Data received from server : " + msg.toString());
    return;
  }

  

  if (finalFile.name == "") {
    const t = msg.toString().split(":");
    finalFile.name = t[0];
    finalFile.hash = t[1];
  } else {
    if(!erro){
      finalFile.data.push(new Buffer.from(msg));
      console.log(finalFile.data.length);
    } else {
      erro = !erro;
    }
    //console.log(finalFile.data);
  }

  /*console.log(
    "Received %d bytes from %s:%d\n",
    msg.length,
    info.address,
    info.port,
  );*/


  if (msg.toString().endsWith("FINAL")) {
    const dataSanitized = Buffer.concat(finalFile.data);
    finalFile.data = new Int8Array(dataSanitized.slice(0, dataSanitized.length-5));
    if (check())
      createFile();
    //console.log(finalFile.hash);
    //console.log(generateChecksum(finalFile.data))
  }
});

function check(){
  const hash = generateChecksum(finalFile.data);
  if (finalFile.hash == hash){
    console.log("arquivo válido");
    return true;
  }else{
    console.log("Hash recebido: " + hash);
    console.log("Hash original: " + finalFile.hash);
    console.log("\narquivo inválido, requisitando novo...");
    finalFile = {
      data: [],
      name: "",
      hash: "",
    };
    client.send(data, 41337, IP, function (error) {
      if (error) {
        client.close();
      } else {
        console.log("\nData recovery sent!");
      }
    });
    return false;
  }
}

function createFile() {
  fs.writeFile(finalFile.name, new Int8Array(Buffer.from(finalFile.data)), function (err) {
    if (err) console.log("ERROR");
    console.log("SALVO " + finalFile.name);
  });
}

client.send(data, 41337, IP, function (error) {
  if (error) {
    client.close();
  } else {
    console.log("Data sent !!");
  }
});

function generateChecksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || "md5")
    .update(str, "utf8")
    .digest(encoding || "hex");
}
