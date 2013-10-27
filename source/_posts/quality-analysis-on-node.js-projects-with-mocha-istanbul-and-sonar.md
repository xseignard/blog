title: Quality analysis on Node.js projects with Mocha, Istanbul and Sonar
date: 2013-04-25 10:38:41
tags:
- node
- mocha
- istanbul
- sonar
twitter_image: https://dl.dropboxusercontent.com/u/17657227/Info/blog/dashboard.png
---
Hello,

What about having a nice dashboard for the code quality of your project? [Sonar](http://www.sonarsource.org) is a well known open source tool to handle that.

It handles a wide range of programming languages, from COBOL to Javascript. So let's give a try to run Sonar on Node.js projects!

# Prerequisites
- I will cover the use of Sonar with [Mocha](http://visionmedia.github.io/mocha/) and [Istanbul](https://github.com/gotwarlost/istanbul), my tools of choice when it comes to js testing. But if you are able to generate xunit ans lcov reports from your test suite, chances the stuff I describe here will also work.
- You need to install Sonar : http://docs.codehaus.org/display/SONAR/Installation+and+Upgrade
- And the Sonar Javascript plugin : http://docs.codehaus.org/display/SONAR/JavaScript+Plugin
- You'll also need Make : http://www.gnu.org/software/make/ which is the build tool I use for Node.js (we could use [Grunt](http://gruntjs.com/), but I still need good arguments to switch to it for node.js, if you have some let me know!)

# Testing with Mocha

Mocha has a lot of built-in functionalities and is extensible. We'll see this point will be really important. Because of its extensibility, you can output your tests results in various formats. If you don't know Mocha, you should give it a try!

So far, Sonar only handles the xunit format as input, so you need a Mocha reporter that can handle it. There is a bundled reporter in Mocha that achieve that, but you need to pipe the console output to the xunit file by yourself. 

You could also use the following reporter plugin that does the work for you : https://github.com/peerigon/xunit-file

So install it : <code>npm install xunit-file --save-dev</code> and then it's just a matter of setting an environment variable during the build to tell where to output the file.

So the xunit task in my <code>Makefile</code> look like this :
```
xunit:
	@# check if reports folder exists, if not create it
	@test -d reports || mkdir reports
	XUNIT_FILE="reports/TESTS-xunit.xml" $(MOCHA) -R xunit-file $(TESTS)
```

Where <code>$(TESTS)</code> is the list of tests. Since I use a convention to name my tests (they always end with <code>.test.js</code>) I can retrieve them easily.
```
TESTS=$(shell find test/ -name "*.test.js")
```

And <code>$(MOCHA)</code> points to the mocha binary. I tend to install the tools I use inside the project rather than globally, it let me handle specific version of them for each project and gives the project some portability. But I don't know if it's a good practice or not. Feel free to drop a comment!
```
MOCHA=node_modules/.bin/mocha
```

You may have noticed the weird name I gave to the xunit output file : <code>TESTS-xunit.xml</code>, it's really important it starts with <code>TESTS</code>! If not, you won't be able to gather tests metrics in Sonar. 

If you dig into the code of Sonar, here is why : https://github.com/SonarSource/sonar-java/blob/master/sonar-surefire-plugin/src/main/java/org/sonar/plugins/surefire/api/AbstractSurefireParser.java#L67

You now have a test report ready to be consumed by Sonar (and Jenkins too if you want!).

# Code coverage with Istanbul

Istanbul is the new cool kid when it comes to code coverage. And it is pretty simple to use! 

<code>instabul cover myNodeCommand</code> will transparently add coverage info to the executed node command!

Since <code>mocha</code> is a node command, everything is ok!

You can just do the following
```
_MOCHA=node_modules/.bin/_mocha
coverage:
	@# check if reports folder exists, if not create it
	@test -d reports || mkdir reports
	$(ISTANBUL) cover --report lcovonly --dir ./reports $(_MOCHA) -- -R spec $(TESTS)
```

Just note the double dash to distinguish <code>istanbul</code> args from the <code>mocha</code> ones and the use of <code>_mocha</code> internal executable (see [istanbul/issues/44](https://github.com/gotwarlost/istanbul/issues/44)).

If you need to produce some other report formats (html, cobertura, etc.), you can check the [report options](https://github.com/gotwarlost/istanbul#the-report-command).

# Sonar
Sonar analysis can be performed in various ways (ant, maven, sonar-runner). Even if i do like maven (yes I do!), there's no way I'll put a <code>pom.xml</code> in a node.js project.

We'll use the [sonar-runner](http://docs.codehaus.org/display/SONAR/Analyzing+with+Sonar+Runner). 

Download it : http://docs.codehaus.org/display/SONAR/Installing+and+Configuring+Sonar+Runner. But, for the sake of portability I prefer to embed it in my project rather than installing it (again, I don't know if it's a good practice, but it's mine).

Then, you need to configure a file at the root of your project that will drive the sonar analysis : <code>sonar-project.properties</code>. This file is really simple, it just tells Sonar where to find the reports we produced before and provide some general info about the project (see http://docs.codehaus.org/display/SONAR/JavaScript+Plugin).
```
sonar.projectKey=sonar-js
sonar.projectName=sonar-js
sonar.projectVersion=0.0.1
 
sonar.sources=src
sonar.tests=test
sonar.language=js
sonar.profile=node

sonar.dynamicAnalysis=reuseReports

sonar.javascript.jstest.reportsPath=reports
sonar.javascript.lcov.reportPath=reports/coverage.lcov
```

The file speaks by itself: project info, project directory structure and tell Sonar to reuse already generated reports and where they are.

Please note that i use a custom profile which is a set of coding rules my code will be tested against. If you don't have this profile on your Sonar instance, you should delete the <code>sonar.profile=node</code>. Your code will be then tested against the default js profile, which is not really adapted for node.js. I'll come back on that.

So after you have the xunit and lcov file, you can run Sonar.

Here is my task in the <code>Makefile</code>:
```
sonar:
	@# add the sonar sonar-runner executable to the PATH and run it
	PATH="$$PWD/tools/sonar-runner-2.2/bin:$$PATH" sonar-runner
```

That's it!

Please note that the actual configuration in sonar-project.properties assumes the Sonar server is running on http://localhost:9000.

You can change that by specifying the right values in sonar-project.properties (see http://docs.codehaus.org/display/SONAR/Analysis+Parameters).

You can now browse your Sonar dashboard and see this nice report:

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/dashboard.png)

In a glance, you can see the wealth of your project : tests results, code coverage, coding rules compliance, complexity, etc...

You can then drill down in any metrics, to see where are the coding rules violations, which line is covered or not, etc. Just read about Sonar to see how powerful it is. You can even see how the metrics evolve between two analysis!

Here is an example of code coverage report:

![](https://dl.dropboxusercontent.com/u/17657227/Info/blog/coverage-dd.png)

You can find a dummy project on github that covers the ideas of this blog post : https://github.com/xseignard/sonar-js

# Notes
I use a custom quality profile in Sonar for Node.js (you can find it here: https://github.com/xseignard/sonar-js/blob/master/tools/node_js.xml).

You can install it following the docs: http://docs.codehaus.org/display/SONAR/Quality+profiles#QualityProfiles-BackupingRestoringProfile

My profile is far from ideal, and can be discussed.

As I told you at the beginning, if you can generate xunit and lcov formats, you're good! So you can easily apply this technique to Angular projects, because of the mighty [Karma runner](http://karma-runner.github.io/), see :

- the reporters section in http://karma-runner.github.io/0.8/config/configuration-file.html
- the coverage page http://karma-runner.github.io/0.8/config/coverage.html

Have fun.


