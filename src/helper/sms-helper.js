const Db = require('../../config/db')
// const _ = require('lodash')

module.exports.decrementToken = function decrementToken (msidn) {
  Db('sender').where({
    msidn: msidn
  }).update({
    token: Db.raw('token - 1')
  }).then((result) => {
    return result
  }).catch((e) => console.error(e))
}

const objHLR = [
  {
    op: 'TSEL',
    regex: '^08(11|12|13|21|22|23|51|52|53)'
  },
  {
    op: 'ISAT',
    regex: '^08(14|15|16|55|56|57|58)'
  },
  {
    op: 'XL',
    regex: '^08(17|18|19|59|77|78|31|32|33|38)'
  },
  {
    op: 'THREE',
    regex: '^08(95|96|97|98|99)'
  },
  {
    op: 'SMART',
    regex: '^08(81|82|83|84|85|86|87|88|89)'
  }

]

module.exports.formatNumber = function formatNumber (destination) {
  let prefix = new RegExp(/^((?:\+62|62))/)
  if (destination.match(new RegExp(prefix))) {
    destination = destination.replace(prefix, '0')
    return destination
  }
  return destination
}
module.exports.getHlr = function getHlr (destination) {
  let prefix = new RegExp(/^((?:\+62|62))/)
  let hlr = 'ALL'
  if (destination.match(new RegExp(prefix))) {
    destination = destination.replace(prefix, '0')
  }

  for (let i = 0; i < objHLR.length; i++) {
    let data = destination.match(new RegExp(objHLR[i].regex.toString()))
    if (data !== null) {
      hlr = objHLR[i].op
      return hlr
    }
  }
  return 'no-hlr'
}

module.exports.replaceChar = function replaceChar (message, pattern, replacement) {
  // const a = '\u00e0'
  // const i = '\u00ec'
  // const u = '\u00f9'
  // const e = '\u00e8'
  // const o = '\u00f2'

  let sentence = message
  if (sentence.indexOf(pattern) !== -1) {
    return sentence.replace(pattern, replacement)
  } else return sentence
}

module.exports.replaceWords = function replaceWords (message, pattern, replacement) {
  let sentence = message
  if (sentence.indexOf(pattern) !== -1) {
    return sentence.replace(pattern, replacement)
  } else return sentence
}
