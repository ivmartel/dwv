#!/usr/bin/env bash

cd $(dirname $0)/..
docco install.js
cd docs
mv install.html index.html
cd ..
