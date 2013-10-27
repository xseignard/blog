title: Plug your Minitel on your Raspberry Pi
date: 2013-05-20 13:07:21
tags:
- DIY
- raspberry
twitter_image: https://dl.dropboxusercontent.com/u/17657227/Info/blog/minitel.png
---
Hi,

So what is a Minitel? According to Wikipedia :

> The Minitel was a Videotex online service accessible through telephone lines, and is considered one of the world's most successful pre-World Wide Web online services.[¹](http://en.wikipedia.org/wiki/Minitel) 

This service was accessible through particular devices. They had a screen, a keyboard and a modem.

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/minitel.jpg)

A screen and a keyboard are just what we need for our Pi, so let's plug them together!

# Minitel and serial communication
The Minitel have a serial port. It's goal is to communicate to peripherals such as a printer or whatever.

The socket is a classic 180° DIN with 5 pins :

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/dinMinitel.JPG)

Here is the description of the pins:

- 1: Rx: data reception 
- 2: Ground
- 3: Tx: data transmission
- 4: Ready to work signal
- 5: 8.5v - 1A power supply

So pins 1,2 and 3 are what we need to communicate through serial with the Pi.

Please note that not all Minitels have this kind of sockets. To find a compatible one, the Minitel must have this socket AND two special keys on the keyboard `Fnct` and `Ctrl`. They are usualy called *Minitel 1B*.

# TTL levels and the Pi

The UART on the Pi works with 0v and 3.3v. But a lot of old stuff use 0v and 5v. This is the case of the Minitel, so we need to adapt the voltage levels :

- Lower the Tx level of the Minitel from 5v to 3.3v
- Raise the Tx level of the Pi from 3.3v to 5v

To achieve that, I used the following schema based on the recommendation of [@lhuet35](https://twitter.com/lhuet35) (thanks!). You can check its Devoxx presentation (in french) here : [3615 Cloud](http://parleys.com/play/51599a1ee4b0ffdd7e058b6b/chapter0/about)

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/minitel.png)

Be careful, the unused pin between the 5v and the GND of the Pi is not depicted on this schema!!

Here is the stuff mounted on a breadboard :

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/minitelProto.JPG)

# Configure a tty on the UART

You then need to configure a tty that will communicate through the UART.

The following configuration is based on a Raspbian, but it should be the same on other distros.

- You may need to install `getty` :
	- `sudo apt-get install getty`
- Backup the `/boot/cmdline.txt` file just in case :)
	- `sudo cp /boot/cmdline.txt /boot/cmdline.bak.txt`
- Edit the file: 
	- `sudo vim /boot/cmdline.txt` 
	- and remove everything related to the serial port `ttyAMA0`, i.e. : `console=ttyAMA0,115200 kgdboc=ttyAMA0,115200`
- Add a `getty` conf on `/etc/inittab` :
	- `7:2345:respawn:/sbin/getty ttyAMA0 4800v23`
	- also check there is no other `getty` conf for this tty on the file
- Then you need to create a `gettydefs` file (or edit it)
	- `sudo vim /etc/gettydefs`
	- and add the following `4800v23# B4800 CS7 PARENB -PARODD GLOBAL # B4800 ISTRIP CS7 PARENB -PARODD GLOBAL BRKINT IGNPAR ICRNL IXON IXANY OPOST ONLCR CREAD HUPCLISIG ICANON ECHO ECHOE ECHOK #@S login: #4800v23` on one line!
	- this will configure the tty on UART

You can now plug the Pi to the Minitel and reboot the Pi.

# Configure the Minitel

You need to switch the Minitel mode to be able to communicate through the serial port.

- Power on the Minitel
- Press `Fnct+T` then `A` : the Minitel will switch to the serial mode
- Press `Fnct+P` then `4` : the Minitel now communicate through serial at 4800bps (the max speed)
- Press `Fnct+T` then `E` : to deactivate the local echo
- Press `↵` and you should now see the login prompt (maybe with some white squares), put your login and you're done!

Be aware that you'll need to do this Minitel configuration everytime you power it up.

Here is a pic of my Minitel :

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/piMinitel.JPG)

Happy coding!