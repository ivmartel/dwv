#!/usr/bin/env bash

cd $(dirname $0)/..

uglifyjs install.js -c -m > install.min.js
