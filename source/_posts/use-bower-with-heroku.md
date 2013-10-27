title: Use bower with heroku
date: 2013-02-18 15:33:26
tags: 
- js
- node
- bower
---
Hello!

[Bower](http://twitter.github.com/bower/) is pretty awsome! [Heroku](http://www.heroku.com/) too!

Use them together!

Without creating your own Heroku [buildpack](https://devcenter.heroku.com/articles/buildpacks), you can achieve that quite easily.

Just add a dependency to Bower in your <code>package.json</code> and then rely on the <code>npm scripts</code> to execute a <code>postinstall</code> command (https://npmjs.org/doc/scripts.html).

So you'll end up with somthing like this in your <code>package.json</code>:

``` javascript
"dependencies": {
    "bower": "0.6.x"
},
"scripts": {
    "postinstall": "./node_modules/bower/bin/bower install"
}
```

And that's it! Heroku will run a <code>npm install</code> that will execute the <code>bower install</code>.

*Pros:* one command to rule them all.

*Cons:* you unnecessarily embed bower as a dependency.