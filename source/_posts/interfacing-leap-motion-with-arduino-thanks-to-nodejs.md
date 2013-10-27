title: Interfacing Leap Motion with Arduino thanks to Node.js
date: 2013-06-25 15:49:38
tags:
- DIY
- node
- leapmotion
---

What about controlling physical things by waving your hands?

Thanks to the Leap Motion, Arduino and a bit of Node.js magic it's pretty simple!

Let's check that!

# Leap Motion
There is a nice feature in the SDK of the Leap Motion: the websocket server.

When activated, the Leap Motion software streams the tracking data over it. You then just need to connect your software to it and you're ready to analyse these data.

Go to the Leap Motion controller settings, and then in the WebSocket tab and activate it.

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/leapWebSocket.png)

The websocket server is now accessible at the following adress: <code>ws://127.0.0.1:6437</code>

# Connect your Node.js application to the websocket server
Node.js is amazing, and connecting your app to the Leap Motion websocket server is just a matter of 2 lines.

In your project, install the <code>ws</code> library with <code>npm install ws --save</code>

And then you can check everything is working with this simple code:
```
var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437');

ws.on('message', function(data, flags) {
    console.log(data);
});
```
When running this script, it should log the data coming from the websocket. If so, you are ok!

It is then just a matter of parsing the data and take what you need in it!

Here you can find an example of a frame: [frame.json](https://gist.github.com/xseignard/5858797)

# Arduino
So you have now all the data you need from the Leap Motion, how can you pass it to the Arduino? Node.js is again the answer!

Thanks to the marvelous [johnny-five](https://github.com/rwldrn/johnny-five) library, you can talk to the Arduino directly from Node.js! To achieve that, you'll just need to upload the Standard Firmata on your Arduino.

Open the Arduino IDE, open the <code>File>Examples>Firmata>StandardFirmata</code> and upload it to your Arduino.

You can now use <code>johnny-five</code> to communicate with the Arduino.

Install it: <code>npm install johnny-five --save</code>. Below is a snippet to connect your board and make the led that is tied to the pin 13 blink.
```
var five = require('johnny-five'),
    board = new five.Board(),
    led;

board.on('ready', function() {
    led = new five.Led(13);
    led.strobe();
});
```
Easy isn't it?

# Plug all this together
It's now really easy to plug all this together. Let's try to make a simple example that turns on the led when the Leap Motion sees 2 hands, and turns it off when not. You should take a look to the sample frame once more: [frame.json](https://gist.github.com/xseignard/5858797). 
```
var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led, frame;

board.on('ready', function() {
    led = new five.Led(13);    
    ws.on('message', function(data, flags) {
        frame = JSON.parse(data); 
        if (frame.hands && frame.hands.length > 1) {
            led.on();
        }
        else {
            led.off();
        }
    });
});
```

That's it! (I hope so, it's not tested :))

# Going further
Here is the demo I made few weeks ago:
<iframe src="http://player.vimeo.com/video/68530396" width="700" height="393" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>

You can find the code on github: [leapLamp](https://github.com/xseignard/leapLamp), feel free to use it and/or ask for some help.

Happy coding.