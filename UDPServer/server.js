const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');
const fs = require('fs');
const buffer = require('buffer');
var crypto = require('crypto');

const byteSize = str => new Blob([str]).size;

server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

  fs.readFile(msg, { encoding: 'utf8', flag: 'r' },
  function (err, data) {
      if (err)
          server.send('404 - File not found', rinfo.port, rinfo.address);
      else
        {
            const packetSize = data.length/~~(Buffer.byteLength(data)/server.getSendBufferSize()+1); 
            const re = new RegExp('.{1,' + ~~packetSize + '}[\s\S]','g');
            const dataSanitized = data.match(re);
            console.log(dataSanitized.length);
            const checksum = generateChecksum(data);
            server.send(msg + ':' + checksum, rinfo.port, rinfo.address);
            dataSanitized.forEach(d => {
                server.send(d, rinfo.port, rinfo.address);
            });
        }
      console.log(`server sent: ` + msg);
  });
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234);
// Prints: server listening 0.0.0.0:41234

function generateChecksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}