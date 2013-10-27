title: Continuous deployement with Github, Travis and Heroku for Node.js
date: 2013-02-18 20:01:23
tags:
- github
- node
- travis
- heroku
---
Cloud services helps the developer to focus on the code. In one or two commands you get a running server, a CI engine, *etc*.

I wont present you Gihtub, Travis or Heroku, if you're not aware of them, just check their websites!

# Prerequisites
You need the following to be installed on your machine:

- the [Heroku toolbelt](https://toolbelt.heroku.com/).
- the [RubyGem](https://rubygems.org/) tool.

# Setting all this up
First of all, you have to get your auth token from Heroku :

```
token=$(heroku auth:token)
```

This will store the token, and keep it for later.

Then, install the Travis CLI tool:

```
sudo gem install travis
```

You now have the Travis CLI tool installed. This will help you to encrypt your Heroku token.

```
travis encrypt HEROKU_API_KEY=$token --add
```

Running the above command will add your encrypted token to your <code>.travis.yml</code>.

Open it and you should see something like this:

```
env: 
  global: 
  - secure: YOUR_ENCRYPTED_TOKEN
```

Travis will decrypt it during the build, and be able to authenticate itself with Heroku.

# Plug the pipe between Travis and Heroku
Now you need to tell Travis to deploy your app to Heroku after a succesful build.

Luckily, Travis can handle it through its [build lifecycle](http://about.travis-ci.org/docs/user/build-configuration/#Build-Lifecycle).

Just add the following to your <code>.travis.yml</code> (don't forget to __replace__ HEROKU_APP_NAME!):


    after_success:
      - wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh
      - git remote add heroku git@heroku.com:HEROKU_APP_NAME.git
      - echo "Host heroku.com" >> ~/.ssh/config
      - echo "   StrictHostKeyChecking no" >> ~/.ssh/config
      - echo "   CheckHostIP no" >> ~/.ssh/config
      - echo "   UserKnownHostsFile=/dev/null" >> ~/.ssh/config
      - yes | heroku keys:add
      - yes | git push heroku master

This will install the Heroku toolbelt, and then configure your Travis worker to communicate with Heroku and finally push your code to it!

And you're done! Now everytime you push your code to Github, Travis will build/test it and deploy it to Heroku!

Here is the whole <code>.travis.yml</code>:

    --- 
    language: node_js
    env: 
      global: 
      - secure: YOUR_ENCRYPTED_TOKEN
    after_success:
      - wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh
      - git remote add heroku git@heroku.com:HEROKU_APP_NAME.git
      - echo "Host heroku.com" >> ~/.ssh/config
      - echo "   StrictHostKeyChecking no" >> ~/.ssh/config
      - echo "   CheckHostIP no" >> ~/.ssh/config
      - echo "   UserKnownHostsFile=/dev/null" >> ~/.ssh/config
      - yes | heroku keys:add
      - yes | git push heroku master
    node_js: 
    - 0.8
