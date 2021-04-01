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
app.get("/open-port-request*", (req, res) => {
    const path = req.query.path
    const baud = parseInt(req.query.baud) || 9600;
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
            try {
                port.write(data.binaryData);
            } catch (error) {

            }
        });
        connection.on("close", data => {
            port.close();
        });
        port.on("data", data => {
            connection.send(data);
        });
        console.log(connection);
        connection.send("Hallo Welt");
    });
    port.on('open', data => {
        res.send("success");
    });
    port.on('error', data => {
        try {
            res.send("error: " + data);
        } catch (error) {

        }
        socket.closeAllConnections()
    });
});

server.listen(9091);