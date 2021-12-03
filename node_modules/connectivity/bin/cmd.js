#!/usr/bin/env node

var connectivity = require('../')

connectivity(function (online) {
  if (online) {
    console.log('connectivity!')
  } else {
    console.error('no connectivity')
    process.exit(1)
  }
})
