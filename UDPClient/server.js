var udp = require('dgram');

var buffer = require('buffer');

// creating a client socket
var client = udp.createSocket('udp4');

//buffer msg
var data = Buffer.from('image.png');

client.on('message',function(msg,info){
  console.log('Data received from server');
  if(msg.toString().slice(0,3) == '404' ) {
    console.log('Data received from server : ' + msg.toString());
    return;
  }

  console.log('Data received from server : ' + msg.toString());

  /*
  const file = msg.toString().split(':');
  fs.writeFile(file[0], file[1], (err) => {
    if(!err) console.log('Data written');
  });
  */

  console.log('Data received from server : ' + msg.toString());
  console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
});

client.send(data,41234,'localhost',function(error){
  if(error){
    client.close();
  }else{
    console.log('Data sent !!!');
  }
});