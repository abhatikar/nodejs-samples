'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = 'HostName=XXXXXXXXXX.azure-devices.net;DeviceId=XXXXXXXX;SharedAccessKey=XXXXXXXXXXXXXX'

var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');

    // Create a message and send it to the IoT Hub every second

	var net = require('net'),
	    JsonSocket = require('json-socket');

	var port = 9838;
	var server = net.createServer();
	server.listen(port);
	server.on('connection', function(socket) { //This is a standard net.Socket
	    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
	    socket.on('message', function(messagedata) {
	    var temperature = parseFloat(messagedata.a);
	    var humidity = parseFloat(messagedata.b);            
	    var data = JSON.stringify({ deviceId: 'abnewdevice',messagetype:'telemetry', timeStamp: Date.now() ,temperature: temperature, humidity: humidity });
	    var message = new Message(data);
	    message.properties.add('temperatureAlert', (temperature > 45) ? 'true' : 'false');
	    console.log("Sending message: " + message.getData());
	    client.sendEvent(message, printResultFor('send'));
	    var result = messagedata.a + messagedata.b;
		socket.sendEndMessage({result: result});
	    });
	});
/*
    setInterval(function(){
        var hbdata = JSON.stringify({ deviceId: 'abnewdevice',messagetype:'heartbeat', timeStamp: Date.now() });
        var hbmessage = new Message(hbdata);
        console.log("Sending message: " + hbmessage.getData());
        client.sendEvent(hbmessage, printResultFor('send'));
    }, 3000);
*/
  }
};

client.open(connectCallback);
