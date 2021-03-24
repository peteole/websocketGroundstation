const http = require("http");
const express = require("express");
const cors = require("cors")

const WebSocket = require("websocket").server;
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
app.get("/open-port-request", (req, res) => {
    const path = req.params.path;
    const baud = req.params.baud || 9600;
    const port = new SerialPort(path, {
        baudRate: baud,
        autoOpen: true
    });
    const socket = new WebSocket({
        httpServer: server,
        path: "/device" + path

    });
    socket.on("request", req => {
        const connection = req.accept();
        connection.on("message", data => {
            if (port.isOpen)
                port.write(data.binaryData);
        });
        connection.on("close", data => {
            port.close();
        });
        port.on("data", data => {
            connection.send(data);
        });
        console.log(con);
    });
    port.on('open', data => {
        res.send("success");
    });
    port.on('error', data => {
        res.send("error: " + data);
    });
});

server.listen(9091);