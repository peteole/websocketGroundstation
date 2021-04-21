const http = require("http");
const express = require("express");
const cors = require("cors");

const WebSocket = require("ws").Server;
const SerialPort = require('serialport');

const app = express();
app.use(cors());
const server = http.createServer(app);
app.get("/devices", (req, res) => {
    SerialPort.list().then((serialPorts) => {
        res.send(JSON.stringify(serialPorts));
    }).catch(reason => {
        res.send("error: " + reason);
    });
});
const ports = new Set()
app.get("/open-port-request*", (req, res) => {
    const path = req.query.path
    const baud = parseInt(req.query.baud) || 9600;
    const port = new SerialPort(path, {
        baudRate: baud,
        autoOpen: true
    });
    ports.add(port)
    const socket = new WebSocket({
        server: server,
        path: "/device" + path,

    });
    socket.on("connection", webSocket => {
        webSocket.on("message", data => {
            try {
                port.write(data);
            } catch (error) {

            }
        });
        webSocket.onclose = event => {
            if (port.isOpen)
                port.close();
            ports.delete(port);
        }
        port.on("data", data => {
            webSocket.send(data);
        });
        webSocket.send("Hallo Welt");
    });
    port.on('open', data => {
        res.send("success");
    });
    port.on('error', data => {
        try {
            console.log(data);
            res.send("error: " + data);
        } catch (error) {

        }
        socket.close();
        if (port.isOpen)
            port.close();
        ports.delete(port);
    });
    port.on("close", data => {
        socket.close();
    });
});

server.listen(9091);