## Overview

This module is designed to make creating a contract simple. It outputs a single file containing all input contract source.

## Example

> This version compiles any number of given paths

```js

const Contract = require('solc-contract')
const path = require('path')

const greeterPath = 'path/to/greeter.sol'

const contracts = new Contract()
  .loadFrom(
    greeterPath
  )
  .writeTo(path.resolve(__dirname, './output'))
  .fileName('greeter.js')
  .compile() 

```

> This version compiles from source

```js

const Contract = require('solc-contract')
const path = require('path')
const fs = require('fs')

const greeterPath = 'path/to/greeter.sol'

const greeter = fs.readFileSync(greeterPath, 'utf8')

const contracts = new Contract()
  .fromSources(
    greeter
  )
  .writeTo(path.resolve(__dirname, './output'))
  .fileName('greeter.js')
  .compile() 

```