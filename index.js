const solc =  require('solc')
const fs = require('fs')
const path = require('path')
const strip = require('strip-comments')

const successMethod = `function (e, contract){
  console.log(e, contract);
  if (typeof contract.address !== 'undefined') {
    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
  }
}`

const Contract = function () {
  this.src = ''

  return this
}

Contract.prototype.loadFrom = function (...contracts) {
  this.sources = Object.assign({}, ...contracts.map(contract => {
    const source = fs.readFileSync(contract, 'utf8')

    return {[path.basename(contract)]: this.sanitizeSource(source)}
  }))

  return this
}

Contract.prototype.writeTo = function(dir) {
  this.writeDir = dir

  return this
}

Contract.prototype.fileName = function(name) {
  this.fileName = name

  return this
}

Contract.prototype.fromSources = function (sources) {
  this.sources = Object.assign({}, ...Object.keys(sources).map(key => {
    return {[key]: this.sanitizeSource(sources[key])}
  }))

  return this
}

Contract.prototype.sanitizeSource = function (source) {
    return source
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/\/\*(.|[\r\n])*?\*\//g, '')
      .replace(/\/\/.*/gm, '')
}

Contract.prototype.generateOutputs = function () {
  const sources = this.sources
  const output = solc.compile({sources}, 1)
  const contract = this.generateContract(output)
  if (this.writeDir) {
    this.src = contract
  }
  else {
    console.log(`================= OUTPUT =================\n${contract}\n`)
  }
  this.writeFile()
}

Contract.prototype.writeFile = function () {
  if (this.writeDir) {
    const fileName = this.fileName || 'output.js'
    const file = path.join(this.writeDir, this.fileName)
    const body = this.src
    fs.writeFileSync(file, body, 'utf8')
  }
}

Contract.prototype.generateContract = function (output) {
  return Object.keys(output.contracts)
    .map(key => {
      const contract = output.contracts[key]
      const contractName = key.split(':')[1]
      const interfaces = JSON.parse(contract.interface)
      const inputs = interfaces
        .map(interface => {
          if (interface.inputs) {
            return interface.inputs.map(input => input.name).join(',\n')
          }
        })
        .filter(Boolean)
        .join(',')

      const bytecode = contract.bytecode
      const gas = 4700000
      return contractOut = `
        var ${contractName}Contract = web3.eth.contract(${contract.interface});
        var ${contractName} = greeterContract.new(
          ${inputs ? `${inputs},\n` : ''}{
            from: web3.eth.accounts[0], 
            data: '0x${bytecode}', 
            gas: '${gas}'
          },
          ${successMethod})`
    })
    .join('')
}

Contract.prototype.compile = function () {
  this.generateOutputs()
}

module.exports = Contract

