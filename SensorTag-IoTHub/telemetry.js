'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = 'HostName=edxabiothub.azure-devices.net;DeviceId=abnewdevice;SharedAccessKey=v4N3xuEXxYVXPoNowhLOOU/P+DOTzFSBRuS7BeMwzwQ='

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
	    var temperature = parseFloat(messagedata.Temperature);
	    var humidity = parseFloat(messagedata.Humidity);            
	    var data = JSON.stringify({ deviceId: 'abnewdevice',messagetype:'telemetry', timeStamp: Date.now() ,temperature: temperature, humidity: humidity });
	    var message = new Message(data);
	    message.properties.add('temperatureAlert', (temperature > 45) ? 'true' : 'false');
	    console.log("Sending message: " + message.getData());
	    client.sendEvent(message, printResultFor('send'));
	    var result = 7 + 8;
		socket.sendEndMessage({result: result});
	    });
	});
  }
};

client.open(connectCallback);
