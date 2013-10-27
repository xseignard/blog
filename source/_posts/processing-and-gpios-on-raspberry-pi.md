title: Processing and GPIOs on Raspberry Pi
date: 2013-04-24 11:49:12
tags:
- processing
- java
- raspberry
---
Hello,

[Processing](http://www.processing.org/) is a nice *programming language* for creative coding, and you can physically interact with the [Raspberry Pi](http://www.raspberrypi.org/) thanks to its GPIOs. So why not combining them?

Let's do it.

# Prerequisites
- A Raspberry Pi (*sic*!) running with a Raspbian image (it may work on other configurations, but not tested).
- All command line below are executed from the home directory (i.e. <code>/home/pi/</code> for the pi user).
- You may need to install some tools <code>sudo apt-get install unzip ca-certificates</code>.

# Install Oracle JDK8 on the Raspberry Pi
The idea of installing JDK8 is not to enjoy those long awaited Lambdas, but to provide the execution platform for Processing. Luckily, Oracle started to provide builds of the JDK for the arm platform.

Download the JDK.
```
wget --no-check-certificate http://www.java.net/download/JavaFXarm/jdk-8-ea-b36e-linux-arm-hflt-29_nov_2012.tar.gz
```

Untar the binaries at the right place.
```
sudo mkdir -p /opt/java
tar xvzf jdk-8-ea-b36e-linux-arm-hflt-29_nov_2012.tar.gz
sudo mv jdk1.8.0 /opt/java
```

Then, you must tell raspbian to use these binaries to provide <code>java</code>.
```
sudo update-alternatives --install "/usr/bin/java" "java" "/opt/java/jdk1.8.0/bin/java" 1
```

If you already had another <code>java</code> version installed, you may need to choose the one we just installed, if not you can skip this.
```
sudo update-alternatives --config java
```

And choose the JDK8 by entering the corresponding number.

Now you need to define some environment variables for <code>java</code> to run properly.
```
echo export JAVA_HOME="/opt/java/jdk1.8.0" >> .bashrc
echo export PATH=$PATH:$JAVA_HOME/bin >> .bashrc
source .bashrc
```

It will add the environment variables at the end of your <code>.bashrc</code>. If you use <code>zsh</code> (and you should! with [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)), just replace <code>.bashrc</code> with <code>.zshrc</code> in the three lines of code above.

Java is now installed, and you can check it with <code>java -version</code>. It should display something like this:
```
java version "1.8.0-ea"
Java(TM) SE Runtime Environment (build 1.8.0-ea-b36e)
Java HotSpot(TM) Client VM (build 25.0-b04, mixed mode)
```

Also check the environment variables, it should return something.
```
echo $JAVA_HOME | grep /opt/java/jdk1.8.0
echo $PATH | grep /opt/java/jdk1.8.0/bin
```

If those checks are not ok, something went wrong, feel free to drop a comment.

# Install Processing
The long awaited 2.0 final version is still not here (at the time of writing), but you can download the last beta.
```
wget http://processing.googlecode.com/files/processing-2.0b8-linux32.tgz
```

Notice we'll use a x86 version, no worries we'll deal with it.

Untar it
```
tar xvzf processing-2.0b8-linux32.tgz
```

Java is bundled with Processing, so we need to tell it to use the java version we installed rather than the bundled one. To do that, we'll remove the java folder inside processing and replace this folder with a symbolic link to the java version we installed.
```
rm -rf processing-2.0b8/java
ln -s $JAVA_HOME processing-2.0b8/java
```

Processing is now installed! You can now log in the UI of the Raspberry (if not already) and run processing from the terminal with the following:
```
cd ~/processing-2.0b8;./processing
```

You'll have to wait a little bit to see the UI coming up.

You may notice some error messages in the terminal, but so far it had no incidence for me, so I ignore them.

# Install a library to interact with GPIOs
So far, I haven't found any Processing *ready* library, so I'll use the [Pi4J](http://pi4j.com/) java library.

Processing has a particular way to handle library, you need to have a special structure in the folders. And Pi4J is not packaged according to the Processing convention. So you'll need to re-arrange stuff (see http://wiki.processing.org/w/How_to_Install_a_Contributed_Library).

First, go back to the <code>/home/pi</code> folder in the terminal.

Then download the Pi4J lib and unzip it:
```
wget https://pi4j.googlecode.com/files/pi4j-0.0.5.zip
unzip pi4j-0.0.5.zip
```

Since Processing is not happy when a lib have something else than letters and numbers in the lib name, you need to rename the unzipped folder.
```
mv pi4j-0.0.5 pi4j
```

Then you need to re-arrange files to stick with the Processing convention.
```
mv pi4j/lib pi4j/library
mv pi4j/library/pi4j-core.jar pi4j/library/pi4j.jar
```

Now you can put the lib in the Processing library folder (defaults to <code>~/sketchbook/libraries</code>).
```
mv pi4j sketchbook/libraries
```

Done! You can now import Pi4J in your Processing sketch!

# Getting started with Pi4J
Here is a simple skecth which will add an ellipse every time a button is pressed.
```java
import com.pi4j.io.gpio.GpioController;
import com.pi4j.io.gpio.GpioFactory;
import com.pi4j.io.gpio.GpioPinDigitalInput;
import com.pi4j.io.gpio.PinPullResistance;
import com.pi4j.io.gpio.RaspiPin;

int WIDTH = 1280;
int HEIGHT = 1024;
GpioController gpio;
GpioPinDigitalInput button;

void setup() {
	size(WIDTH, HEIGHT);
	gpio = GpioFactory.getInstance();
	button = gpio.provisionDigitalInputPin(RaspiPin.GPIO_02, PinPullResistance.PULL_DOWN);
}

void draw() {
	if (button.isHigh()) {
		println("pressed");
		fill(int(random(255)), int(random(255)), int(random(255)));
		float x = random(WIDTH);
		float y = random(HEIGHT);
		ellipse(x, y, 80, 80);
	};
}
```

I invite you to read the Pi4J documentation to dive into it. You should use events rather than testing the state of a button as shown above (see http://pi4j.com/example/listener.html).

Here is the wiring schema that comes along the sketch from above (borrowed from http://pi4j.com/).
![](http://pi4j.com/images/gpio-listener-example.png)

If you try to run it, you'll face some permission issues since Pi4J require root privileges to access GPIOs. For now I export the application and run it with <code>sudo</code> to bypass it. It should exist a cleaner way to handle it. I'll update this post with a proper solution if there is.


You are ready to poop some creative code! Enjoy!

