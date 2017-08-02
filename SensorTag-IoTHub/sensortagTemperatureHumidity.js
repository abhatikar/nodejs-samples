var SensorTag = require('sensortag');		// sensortag library
var net = require('net');
JsonSocket = require('json-socket');

// listen for tags:
SensorTag.discover(function(tag) {
	// when you disconnect from a tag, exit the program:
	tag.on('disconnect', function() {
		console.log('disconnected!');
		process.exit(0);
	});

	function connectAndSetUpMe() {			// attempt to connect to the tag
	     console.log('connectAndSetUp');
	     tag.connectAndSetUp(enableTempHum);	// when you connect, call enableTempHum
	}

	function enableTempHum() {		// attempt to enable the Temperature/Humidity sensor
	     console.log('enableHumidity');
	     // when you enable the Temperature/Humidity sensor, start notifications:
	     tag.enableHumidity(notifyMe);
	}

	function notifyMe() {
	    tag.notifyHumidity(listenForTempHumidityReading);
	}

	// When you get an humidity change, print it out:
	function listenForTempHumidityReading() {
		tag.on('humidityChange', function(temperature, humidity) {
			console.log('\ttemperature = %d °C', temperature.toFixed(1));
			console.log('\thumidity = %d %', humidity.toFixed(1)); 
			var port = 9838; //The same port that the server is listening on
			var host = '127.0.0.1';
			var socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
			socket.connect(port, host);
			socket.on('error', function(e) {
				if(e.code == 'ECONNREFUSED') {
					console.log('wating for connection to port ' + port);
					socket.setTimeout(5000, function() {
						socket.connect(port, host, function(){
							console.log('connected to : ' + host + ':' + port);
						});
					});
					console.log('Timeout for 5 seconds before trying port:' + port + ' again');
				}   
			});
			socket.on('connect', function() { //Don't send until we're connected
				socket.sendMessage({Temperature: temperature.toFixed(1), Humidity: humidity.toFixed(1)});
				socket.on('message', function(message) {
					console.log('The result is: '+message.result);
				});
			});
		});
	}

	// Now that you've defined all the functions, start the process:
	connectAndSetUpMe();
});
