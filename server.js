/**
 * Сервер:  • TCP-порт 4000 для Arduino
 *          • HTTP-порт 80 для браузера
 *          • Команда /toggle → "TOGGLE\n" в Arduino
 */
const http = require('http');
const fs   = require('fs');
const net  = require('net');
const path = require('path');

let arduinoSocket = null;                    // текущее подключение Arduino

/* ---------- TCP для Arduino ---------- */
net
  .createServer(sock => {
    console.log('Arduino connected:', sock.remoteAddress);
    arduinoSocket = sock;

    sock.on('end', () => {
      console.log('Arduino disconnected');
      if (arduinoSocket === sock) arduinoSocket = null;
    });
  })
  .listen(4000, () => console.log('TCP • listening on :4000'));

/* ---------- HTTP для браузера ---------- */
http
  .createServer((req, res) => {
    if (req.url === '/toggle') {             // REST-эндпоинт
      if (arduinoSocket) {
        arduinoSocket.write('TOGGLE\n');
        res.writeHead(200, {'Content-Type': 'text/plain'});
        return res.end('LED toggled');
      }
      res.writeHead(503, {'Content-Type': 'text/plain'});
      return res.end('Arduino not connected');
    }

    // дефолт: отдаём страницу
    fs.createReadStream(path.join(__dirname, 'index.html'))
      .pipe(res);
  })
  .listen(80, () => console.log('HTTP • listening on :80'));
