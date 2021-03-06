#!/usr/bin/env bash

curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get install -y nodejs
sudo yarn global add pm2
yarn install
