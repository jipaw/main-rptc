const crypto = require('crypto')
const Wreck = require('wreck')
const _ = require('lodash')
// const xmlBuilder = require('xmlbuilder')
const xmlParser = require('xml2js')
// const Db = require('../../../config/db')
// const aguid = require('aguid')
// const Boom = require('boom')
// const password = require('../../lib/pass')
// const joiSchema = require('../../lib/schema')
// const requestSchema = joiSchema.requestSchema
// const rptRequestSchema = joiSchema.rptRequestSchema

/* CREDENTIAL POS
 * url : http://27.50.30.113:3000/smsgwpos/smsgws.aspx
 * token : 2894D2C1-D3BF-4D26-A5DB-D6792EECC672
 * userid : pos2017
 * pass : 2eB7z1
 * http://27.50.30.113:10300/reportsms/smsrpt.asmx
*/

const vendor = [{
  name: 'vendor1',
  baseUrl: 'http://27.50.30.113:3000',
  uri: '/smsgwpos/smsgws.aspx',
  userid: 'pos2017',
  pass: '2eB7z1',
  token: '2894D2C1-D3BF-4D26-A5DB-D6792EECC672',
  status: 0,
  priority: 1
},
{
  name: 'vendor2',
  baseUrl: 'http://27.50.30.11:3000',
  uri: '/smsjne/smsgws.aspx',
  userid: 'jne',
  pass: 'g5D4ws1',
  token: '4D53CBF9-8A22-4CDD-845C-4416D19AA72E',
  status: 0,
  priority: 2
},
{
  name: 'vendor3',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportsms/smsrpt.asmx',
  userid: 'pos2017',
  pass: '2eB7z1',
  token: '2894D2C1-D3BF-4D26-A5DB-D6792EECC672',
  status: 1,
  priority: 1
},
{
  name: 'vendor4',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportsms/smsrpt.asmx',
  userid: 'jne',
  pass: 'g5D4ws1',
  token: '4D53CBF9-8A22-4CDD-845C-4416D19AA72E',
  status: 1,
  priority: 1
},
{
  name: 'vendor5',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportsms/smsrpt.asmx',
  userid: 'tiki',
  pass: 'b3fD78g1',
  token: '0516A1A5-431A-4B77-AA7D-BEEB49BDA5F7',
  status: 1,
  priority: 1
},
{
  name: 'vendor6',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportsms/smsrpt.asmx',
  userid: 'tokopedia',
  pass: 'vc31G5ds1',
  token: '6C53E5ED-E789-47F8-B9CA-84222D54DA51',
  status: 1,
  priority: 1
},
{
  name: 'vendor7',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportussd/smsrpt.asmx',
  userid: 'jne2',
  pass: 'y7g0Hw3',
  token: '11CBC173-2218-411B-9419-ED26C4E9B6B9',
  status: 1,
  priority: 1
},
{
  name: 'vendor8',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportussd/smsrpt.asmx',
  userid: 'tokopedia2',
  pass: 'dFg53hR1',
  token: '11CBC173-2218-411B-9419-ED26C4E9B6B9',
  status: 1,
  priority: 1
},
{
  name: 'vendor9',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportsms/smsrpt.asmx',
  userid: 'tokopediabc',
  pass: 'xb63f1',
  token: '11CBC173-2218-411B-9419-ED26C4E9B6B9',
  status: 1,
  priority: 1
},
{
  name: 'vendor10',
  baseUrl: 'http://27.50.30.113:10300',
  uri: '/reportsms/smsrpt.asmx',
  userid: 'tikiserang',
  pass: 'm4S77qw',
  token: '5105EC7B-00D9-4453-83AE-ACBFDBD617F4',
  status: 1,
  priority: 1
}]

module.exports.chooseVendor = function chooseVendor () {
  let case1 = _.filter(vendor, 'status', 1)
  let vend = _.sortBy(case1, 'priority')
  // console.log(vend)
  return vend[0]
}
module.exports.chooseVendorByUser = function chooseVendorByUser (user) {
  let case1 = _.filter(vendor, 'userid', user)
  let case2 = _.filter(case1, 'status', 1)
  let vend = _.sortBy(case2, 'priority')
  // console.log(vend)
  return vend[0]
}
/*
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd="http://www.w3.org/2001/XMLSchema"
xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
  <smsrpt_summary xmlns="mpsmsrpt">
    <userid>USERID</userid>
    <periode>TRXID(FORMAT: yyyyMMdd)</periode>
  </smsrpt_summary>
  </soap:Body>
</soap:Envelope>
*/
module.exports.buildRptRequest = function buildRptRequest (vendor, request, callback) {
  const data = vendor
  const req = request
  if (data.name === 'vendor3' || data.name === 'vendor4' || data.name === 'vendor5' || data.name === 'vendor6' || data.name === 'vendor7' || data.name === 'vendor8' || data.name === 'vendor9' || data.name === 'vendor10') {
    const { userid } = data
    const { periode } = req

    const reqReport = '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
      'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<smsrpt_summary xmlns="mpsmsrpt">' +
          '<userid>' + userid + '</userid>' +
          '<periode>' + periode + '</periode>' +
        '</smsrpt_summary>' +
        '</soap:Body>' +
      '</soap:Envelope>'

    const method = 'POST'
    const uri = data.uri
    const options = {
      baseUrl: data.baseUrl,
      payload: reqReport,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(reqReport)
      },
      timeout: 120000
    }

    // console.log(options.payload)
    // console.log(options.headers)

    Wreck.request(method, uri, options, (e, res) => {
      if (e) console.log(e)
      Wreck.read(res, null, (e, body) => {
        if (e) console.log(e)
        xmlParser.parseString(body, (e, result) => {
          if (e) callback(e)
          // console.log(result)
          callback(result)
        })
      })
    })
  }
}

module.exports.buildRptRequestByCity = function buildRptRequestByCity (vendor, request, callback) {
  const data = vendor
  const req = request
  if (data.name === 'vendor9') {
    const { userid } = data
    const { startDate, endDate } = req

    const reqReport = '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
      'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<smsrpt_summary_date_city xmlns="mpsmsrpt">' +
          '<userid>' + userid + '</userid>' +
          '<begindate>' + startDate + '</begindate>' +
          '<enddate>' + endDate + '</enddate>' +
        '</smsrpt_summary_date_city>' +
        '</soap:Body>' +
      '</soap:Envelope>'

    const method = 'POST'
    const uri = data.uri
    const options = {
      baseUrl: data.baseUrl,
      payload: reqReport,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(reqReport)
      },
      timeout: 120000
    }

    // console.log(options.payload)
    // console.log(options.headers)

    Wreck.request(method, uri, options, (e, res) => {
      if (e) console.log(e)
      Wreck.read(res, null, (e, body) => {
        if (e) console.log(e)
        xmlParser.parseString(body, (e, result) => {
          if (e) callback(e)
          // console.log(result)
          callback(result)
        })
      })
    })
  }
}

module.exports.buildRptRequestByRange = function buildRptRequestByRange (vendor, request, callback) {
  const data = vendor
  const req = request
  if (data.name === 'vendor3' || data.name === 'vendor4' || data.name === 'vendor5' || data.name === 'vendor6' || data.name === 'vendor7' || data.name === 'vendor8' || data.name === 'vendor9' || data.name === 'vendor10') {
    const { userid } = data
    const { startDate, endDate } = req

    const reqReport = '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
      'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<smsrpt_summary_date xmlns="mpsmsrpt">' +
          '<userid>' + userid + '</userid>' +
          '<begindate>' + startDate + '</begindate>' +
          '<enddate>' + endDate + '</enddate>' +
        '</smsrpt_summary_date>' +
        '</soap:Body>' +
      '</soap:Envelope>'

    const method = 'POST'
    const uri = data.uri
    const options = {
      baseUrl: data.baseUrl,
      payload: reqReport,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(reqReport)
      },
      timeout: 120000
    }

    // console.log(options.payload)
    // console.log(options.headers)

    Wreck.request(method, uri, options, (e, res) => {
      if (e) console.log(e)
      Wreck.read(res, null, (e, body) => {
        if (e) console.log(e)
        xmlParser.parseString(body, (e, result) => {
          if (e) callback(e)
          // console.log(result)
          callback(result)
        })
      })
    })
  }
}

module.exports.buildRptRequestById = function buildRptRequest (vendor, request, callback) {
  console.log(vendor)
  console.log(request)
  const data = vendor
  const req = request
  if (data.name === 'vendor3' || data.name === 'vendor4' || data.name === 'vendor5' || data.name === 'vendor6' || data.name === 'vendor7' || data.name === 'vendor8' || data.name === 'vendor9' || data.name === 'vendor10') {
    const { userid } = data
    const { periode, id } = req

    const reqReport = '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
      'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<smsrpt_detail_id xmlns="mpsmsrpt">' +
          '<userid>' + userid + '</userid>' +
          '<periode>' + periode + '</periode>' +
          '<id>' + id + '</id>' +
        '</smsrpt_detail_id>' +
        '</soap:Body>' +
      '</soap:Envelope>'

    const method = 'POST'
    const uri = data.uri
    const options = {
      baseUrl: data.baseUrl,
      payload: reqReport,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(reqReport)
      },
      timeout: 60000
    }

    // console.log(options.payload)
    // console.log(options.headers)

    Wreck.request(method, uri, options, (e, res) => {
      if (e) console.log(e)
      Wreck.read(res, null, (e, body) => {
        if (e) console.log(e)
        xmlParser.parseString(body, (e, result) => {
          if (e) callback(e)
          // console.log(result)
          callback(result)
        })
      })
    })
  }
}

module.exports.buildRequest = function buildRequest (vendor, request, callback) {
  const data = vendor
  const req = request
  if (data.name === 'vendor1') {
    const { userid, pass, token } = data
    const { trxid, trxdate, message, msidn } = req
    const key = token + trxdate + msidn
    const apiKey = crypto.createHash('sha256').update(key).digest('hex')
    const key2 = Buffer.from(pass + ':' + userid).toString('base64')
    const bearer = crypto.createHash('sha256').update(key2).digest('hex')

    const payload = {
      smsgwRq: {
        userid: userid,
        trxid: trxid,
        id: msidn,
        message: message,
        trxdate: trxdate
      }
    }

    const method = 'POST'
    const uri = data.uri
    const options = {
      baseUrl: data.baseUrl,
      payload: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'Authorization': 'Basic ' + bearer
      },
      timeout: 160000
    }

    // console.log(key2)
    // console.log(options.payload)
    // console.log(options.headers)

    Wreck.request(method, uri, options, (e, res) => {
      if (e) console.log(e)
      Wreck.read(res, null, (e, body) => {
        if (e) console.log(e)
        callback(body.toString())
      })
    })
  }
}
