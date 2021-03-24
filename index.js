const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1', {
  baudRate: 9600
})