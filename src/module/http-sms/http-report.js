const Path = require('path')
const Knex = require('../../../config/db')
const moment = require('moment')
// const Boom = require('boom')
const _ = require('lodash')
const flat = require('flat')
const reqHelper = require('../../helper/request-builder')
// const Joi = require('joi')
// const Boom = require('boom')
// const pass = require('../../../lib/password')

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/dashboard',
      handler: (request, reply) => {
        console.log(request.payload)
        let myTime = moment(request.payload.startDate).format('YYYYMMDD') || moment().format('YYYYMMDD')
        Knex('users').select('*').where('username', request.auth.credentials.username).asCallback((e, [member]) => {
          if (e) return console.error(e)
        // start query to count records
          const name = member.name
          const username = member.username
          const vendor = reqHelper.chooseVendorByUser(username)
          const req = {
            userid: username,
            periode: myTime
          }
          console.log(vendor)
          reqHelper.buildRptRequest(vendor, req, (response) => {
          /* get response */
            let data = response
            let flattenData = flat(data)
            let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summaryResponse.0.smsrpt_summaryResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
            // console.log(data2)
            if (!newDataSet) {
              return reply({
                username: name,
                sms_indosat: 0,
                sms_telkomsel: 0,
                sms_total: 0
              })
            }
            data = response['soap:Envelope']['soap:Body'][0].smsrpt_summaryResponse[0].smsrpt_summaryResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
          /* reply to member */
            console.log(data)
            let resp = []
            for (let i = 0; i < data.length; i++) {
              let product = data[i].product[0]
              let total = data[i].total[0]
              let obj = {
                product: product,
                total: total
              }
              resp.push(obj)
            }
            console.log(resp)
            if (resp.length === 1) {
              return reply({
                username: name,
                sms_indosat: 0,
                sms_telkomsel: resp[0].total || 0,
                sms_total: parseInt(resp[0].total)
              })
            } else {
              return reply({
                username: name,
                sms_indosat: resp[0].total || 0,
                sms_telkomsel: resp[1].total || 0,
                sms_total: parseInt(resp[0].total) + parseInt(resp[1].total)
              })
            }
          })
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/dashboard2',
      handler: (request, reply) => {
        console.log(request.payload)
        let myTime = moment(request.payload.startDate).format('YYYYMMDD') || moment().format('YYYYMMDD')
        Knex('users').select('*').where('username', request.auth.credentials.username).asCallback((e, [member]) => {
          if (e) return console.error(e)
        // start query to count records
          const name = member.name
          const username = member.username
          const vendor = reqHelper.chooseVendorByUser(username)
          const req = {
            userid: username,
            periode: myTime
          }
          console.log(vendor)
          reqHelper.buildRptRequest(vendor, req, (response) => {
          /* get response */
            let data = response
            let flattenData = flat(data)
            let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summaryResponse.0.smsrpt_summaryResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
            // console.log(data2)
            if (!newDataSet) {
              return reply({
                username: name,
                sms_indosat: 0,
                sms_telkomsel: 0,
                sms_total: 0
              })
            }
            data = response['soap:Envelope']['soap:Body'][0].smsrpt_summaryResponse[0].smsrpt_summaryResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
          /* reply to member */
            console.log(data)
            let resp = []
            for (let i = 0; i < data.length; i++) {
              let product = data[i].product[0]
              let total = data[i].total[0]
              let obj = {
                product: product,
                total: total
              }
              resp.push(obj)
            }
            console.log(resp)
            return reply(resp)
          })
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/rangecity',
      handler: (request, reply) => {
        console.log(request.payload)
        let startDate = moment(request.payload.startDate).format('YYYYMMDD') || moment().format('YYYYMMDD')
        let endDate = moment(request.payload.endDate).format('YYYYMMDD') || moment().format('YYYYMMDD')
        Knex('users').select('*').where('username', request.auth.credentials.username).asCallback((e, [member]) => {
          if (e) return console.error(e)
        // start query to count records
          const name = member.name
          const username = member.username
          const vendor = reqHelper.chooseVendorByUser(username)
          const req = {
            userid: username,
            startDate: startDate,
            endDate: endDate
          }
          console.log(vendor)
          reqHelper.buildRptRequestByCity(vendor, req, (response) => {
          /* get response */
            let data = response
            let flattenData = flat(data)
            let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summary_date_cityResponse.0.smsrpt_summary_date_cityResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
            console.log(newDataSet)
            if (!newDataSet) {
              return reply({
                username: name,
                sms_indosat: 0,
                sms_telkomsel: 0,
                sms_total: 0
              })
            }
            data = response['soap:Envelope']['soap:Body'][0].smsrpt_summary_date_cityResponse[0].smsrpt_summary_date_cityResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
          /* reply to member */
            console.log(data)
            let resp = []
            for (let i = 0; i < data.length; i++) {
              let product = 'OTHER SMS'
              if (_.has(data[i], 'product') === true) {
                product = data[i].product[0]
              }
              let status = data[i].Status[0]
              let city = data[i].City[0]
              let total = data[i].total[0]
              let obj = {
                product: product,
                status: status,
                city: city,
                total: total
              }
              resp.push(obj)
            }
            console.log(resp)
            return reply({
              username: name,
              data: _.sortByOrder(resp, ['product', 'status'], ['asc', 'desc'])
            })
          })
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/rangedata',
      handler: (request, reply) => {
        console.log(request.payload)
        let startDate = moment(request.payload.startDate).format('YYYYMMDD') || moment().format('YYYYMMDD')
        let endDate = moment(request.payload.endDate).format('YYYYMMDD') || moment().format('YYYYMMDD')
        Knex('users').select('*').where('username', request.auth.credentials.username).asCallback((e, [member]) => {
          if (e) return console.error(e)
        // start query to count records
          const name = member.name
          const username = member.username
          const vendor = reqHelper.chooseVendorByUser(username)
          const req = {
            userid: username,
            startDate: startDate,
            endDate: endDate
          }
          console.log(vendor)
          reqHelper.buildRptRequestByRange(vendor, req, (response) => {
          /* get response */
            let data = response
            let flattenData = flat(data)
            let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summary_dateResponse.0.smsrpt_summary_dateResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
            console.log(newDataSet)
            if (!newDataSet) {
              return reply({
                username: name,
                sms_indosat: 0,
                sms_telkomsel: 0,
                sms_total: 0
              })
            }
            data = response['soap:Envelope']['soap:Body'][0].smsrpt_summary_dateResponse[0].smsrpt_summary_dateResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
          /* reply to member */
            console.log(data)
            let resp = []
            for (let i = 0; i < data.length; i++) {
              let product = 'OTHER SMS'
              if (_.has(data[i], 'product') === true) {
                product = data[i].product[0]
              }
              let status = data[i].Status[0]
              let total = data[i].total[0]
              let obj = {
                product: product,
                status: status,
                total: total
              }
              resp.push(obj)
            }
            console.log(resp)
            return reply({
              username: name,
              data: _.sortByOrder(resp, ['product', 'status'], ['asc', 'desc'])
            })
          })
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/ussd/daily',
      handler: (request, reply) => {
        const { startDate } = request.payload
        const { username } = request.auth.credentials
        Knex('sms_record').where('user_name', username).andWhere('count_date', startDate).orderBy('count_time', 'asc').select('*').then((result) => {
          // console.log(result)
          // function sumArray (a, b) {
          //   var c = []
          //   for (var i = 0; i < Math.max(a.length, b.length); i++) {
          //     c.push((a[i] || 0) + (b[i] || 0))
          //   }
          //   return c
          // }
          function setResultArray (arr) {
            let req = []
            for (let i = 0; i < arr.length; i++) {
              let counter = i - 1
              if (i === 0) counter = i
              let data = arr[i].success - arr[counter].success
              if (data < 1) {
                data = 0
              }
              req.push(data)
            }
            return req
          }
          let labels = []
          let series = []
          let data = []
          let requestUssd = setResultArray(_.filter(result, { product: 'USSD SMS' }))
          for (let j = 0; j < result.length; j++) {
            let countTime = result[j].count_time.slice(0, 5)
            labels.push(countTime)
          }
          series.push('USSD')
          data.push(requestUssd)
          const dataSets = {
            labels: _.uniq(labels),
            data: data,
            series: series
          }
          console.log(dataSets)
          reply(dataSets)
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/graph2/daily',
      handler: (request, reply) => {
        const { startDate } = request.payload
        const { username } = request.auth.credentials
        Knex('sms_record').where('user_name', username).andWhere('count_date', startDate).orderBy('count_time', 'asc').select('*').then((result) => {
          // console.log(result)
          function sumArray (a, b) {
            var c = []
            for (var i = 0; i < Math.max(a.length, b.length); i++) {
              c.push((a[i] || 0) + (b[i] || 0))
            }
            return c
          }
          function setResultArray (arr) {
            let req = []
            for (let i = 0; i < arr.length; i++) {
              let counter = i - 1
              if (i === 0) counter = i
              let data = arr[i].success - arr[counter].success
              if (data < 1) {
                data = 0
              }
              req.push(data)
            }
            return req
          }
          let labels = []
          let series = []
          let data = []
          let requestTsel = setResultArray(_.filter(result, { product: 'TELKOMSEL SMS' }))
          let requestIsat = setResultArray(_.filter(result, { product: 'INDOSAT SMS' }))
          let requestXl = setResultArray(_.filter(result, { product: 'XL SMS' }))
          let requestThree = setResultArray(_.filter(result, { product: 'THREE SMS' }))
          let requestSmartfren = setResultArray(_.filter(result, { product: 'SMARTFREN SMS' }))
          for (let j = 0; j < result.length; j++) {
            let countTime = result[j].count_time.slice(0, 5)
            labels.push(countTime)
          }
          let requestOther = sumArray(requestThree, requestSmartfren)
          series.push('INDOSAT', 'TELKOMSEL', 'XL', 'OTHER')
          data.push(requestIsat, requestTsel, requestXl, requestOther)
          const dataSets = {
            labels: _.uniq(labels),
            data: data,
            series: series
          }
          // console.log(dataSets)
          reply(dataSets)
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/graph/daily',
      handler: (request, reply) => {
        const { startDate } = request.payload
        const { username } = request.auth.credentials
        Knex('sms_record').where('user_name', username).andWhere('count_date', startDate).orderBy('count_time').select('*').then((result) => {
          // console.log(result)
          function setResultArray (arr) {
            let req = []
            for (let i = 0; i < arr.length; i++) {
              let countTime = arr[i].count_time.slice(0, 5)
              let counter = i - 1
              if (i === 0) counter = i
              let dataFailed = arr[i].failed - arr[counter].failed
              if (dataFailed < 1) dataFailed = 0
              let dataSuccess = arr[i].success - arr[counter].success
              if (dataSuccess < 1) dataSuccess = 0
              let objA = {
                operator: arr[i].product,
                count_time: countTime,
                success: arr[i].success,
                sms_failed: dataFailed,
                sms_request: dataSuccess
              }
              req.push(objA)
            }
            return req
          }
          let labels = []
          let series = []
          let items = []
          let trequest = []
          let success = []
          let failed = []
          let requestIsat = setResultArray(_.filter(result, { product: 'INDOSAT SMS' }))
          let requestTsel = setResultArray(_.filter(result, { product: 'TELKOMSEL SMS' }))
          let requestXl = setResultArray(_.filter(result, { product: 'XL SMS' }))
          let requestThree = setResultArray(_.filter(result, { product: 'THREE SMS' }))
          let requestSmartfren = setResultArray(_.filter(result, { product: 'SMARTFREN SMS' }))
          let requestUssd = setResultArray(_.filter(result, { product: 'USSD SMS' }))
          let requestOther = setResultArray(_.filter(result, { product: 'OTHER SMS' }))
          for (let j = 0; j < result.length; j++) {
            let countTime = result[j].count_time.slice(0, 5)

            let objA = {
              operator: result[j].product,
              count_time: countTime,
              success: result[j].success,
              sms_failed: result[j].failed,
              sms_request: result[j].request
            }
            items.push(objA)
            labels.push(countTime)
            trequest.push(result[j].request)
            success.push(result[j].success)
            failed.push(result[j].failed)
          }
          let items2 = requestIsat.concat(requestTsel, requestXl, requestThree, requestSmartfren, requestOther, requestUssd)
          series.push(trequest, failed)
          const data = {
            // labels: labels,
            // series: series,
            items: items2
          }
          // console.log(data)
          reply(data)
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/graph/monthly',
      handler: (request, reply) => {
        console.log(request.payload)
        const { month } = request.payload
        const { username } = request.auth.credentials
        let data = month.toString()
        if (data.length === 1) { data = '0' + data }
        const startDate = moment().format('YYYY') + '-' + data
        Knex('sms_record').where({user_name: username, count_time: '0'}).andWhere('count_date', 'like', '%' + startDate + '%').orderBy('count_date').select('*').then((result) => {
        // console.log(result)
          let labels = []
          let series = []
          let items = []
          let trequest = []
          let success = []
          let failed = []
          for (let j = 0; j < result.length; j++) {
            let countDate = moment(result[j].count_date).format('Do')
            let objA = {
              operator: result[j].product,
              count_date: countDate,
              success: result[j].success,
              sms_failed: result[j].failed,
              sms_request: result[j].success
            }
            items.push(objA)
            labels.push(countDate)
            trequest.push(result[j].count_request)
            success.push(result[j].success)
            failed.push(result[j].failed)
          }
          series.push(success, failed)
          const data = {
            labels: labels,
            series: series,
            items: items
          }
          console.log(data)
          reply(data)
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/ussd/monthly',
      handler: (request, reply) => {
        console.log(request.payload)
        const { month } = request.payload
        const { username } = request.auth.credentials
        let data = month.toString()
        if (data.length === 1) { data = '0' + data }
        const startDate = moment().format('YYYY') + '-' + data
        Knex('sms_record').where({user_name: username, count_time: '0'}).andWhere('count_date', 'like', '%' + startDate + '%').orderBy('count_date', 'asc').select('*').then((result) => {
        // console.log(result)
          function setResultArray (arr) {
            let req = []
            for (let i = 0; i < arr.length; i++) {
              req.push(arr[i].count_request)
            }
            return req
          }
          let labels = []
          let series = []
          let data = []
          let requestUssd = setResultArray(_.filter(result, { product: 'USSD SMS' }))
          for (let j = 0; j < result.length; j++) {
            let countTime = moment(result[j].count_date).format('Do')
            labels.push(countTime)
          }
          series.push('USSD')
          data.push(requestUssd)
          const dataSets = {
            labels: _.uniq(labels),
            data: data,
            series: series
          }
          console.log(dataSets)
          reply(dataSets)
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/graph2/monthly',
      handler: (request, reply) => {
        console.log(request.payload)
        const { month } = request.payload
        const { username } = request.auth.credentials
        let data = month.toString()
        if (data.length === 1) { data = '0' + data }
        const startDate = moment().format('YYYY') + '-' + data
        Knex('sms_record').where({user_name: username, count_time: '0'}).andWhere('count_date', 'like', '%' + startDate + '%').orderBy('count_date', 'asc').select('*').then((result) => {
        // console.log(result)
          function sumArray (a, b) {
            var c = []
            for (var i = 0; i < Math.max(a.length, b.length); i++) {
              c.push((a[i] || 0) + (b[i] || 0))
            }
            return c
          }
          function setResultArray (arr) {
            let req = []
            for (let i = 0; i < arr.length; i++) {
              req.push(arr[i].success)
            }
            return req
          }
          let labels = []
          let series = []
          let data = []
          let requestTsel = setResultArray(_.filter(result, { product: 'TELKOMSEL SMS' }))
          let requestIsat = setResultArray(_.filter(result, { product: 'INDOSAT SMS' }))
          let requestXl = setResultArray(_.filter(result, { product: 'XL SMS' }))
          let requestThree = setResultArray(_.filter(result, { product: 'THREE SMS' }))
          let requestSmartfren = setResultArray(_.filter(result, { product: 'SMARTFREN SMS' }))
          for (let j = 0; j < result.length; j++) {
            let countTime = moment(result[j].count_date).format('Do')
            labels.push(countTime)
          }
          let requestOther = sumArray(requestThree, requestSmartfren)
          series.push('INDOSAT', 'TELKOMSEL', 'XL', 'OTHER')
          data.push(requestIsat, requestTsel, requestXl, requestOther)
          const dataSets = {
            labels: _.uniq(labels),
            data: data,
            series: series
          }
          console.log(dataSets)
          reply(dataSets)
        })
      }
    },
    {
      method: 'POST',
      config: {
        auth: 'jwt'
      },
      path: '/rawdata',
      handler: (request, reply) => {
        console.log(request.payload)
        let startDate = moment(request.payload.startDate).format('YYYYMMDD') || moment().format('YYYYMMDD')
        let id = request.payload.msisdn
        let username = request.auth.credentials.username
        const vendor = reqHelper.chooseVendorByUser(username)
        const req = {
          userid: username,
          periode: startDate,
          id: id
        }
        reqHelper.buildRptRequestById(vendor, req, (response) => {
          /* get response */
          // console.log(response)
          let data = response
          let flattenData = flat(data)
          let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_detail_idResponse.0.smsrpt_detail_idResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
          // console.log(data2)
          if (!newDataSet) {
            return reply().code(204)
          }
          data = response['soap:Envelope']['soap:Body'][0].smsrpt_detail_idResponse[0].smsrpt_detail_idResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
          /* reply to member */
          let resp = []
          for (let i = 0; i < data.length; i++) {
            let trxid = data[i].trxid[0]
            let date = data[i].date[0]
            let trxtype = data[i].trxtype[0]
            let retailer = data[i].retailer[0]
            let id = data[i].id[0]
            let message = data[i].message[0]
            let product = data[i].product[0]
            let status = ''
            if (data[i].status[0] === '0') {
              status = 'success'
            } else {
              status = 'failed'
            }
            let userid = data[i].userid[0]
            let obj = {
              trxid: trxid,
              date: date,
              trxtype: trxtype,
              retailer: retailer,
              id: id,
              message: message,
              product: product,
              status: status,
              userid: userid
            }
            resp.push(obj)
          }
          // console.log(resp)
          reply({
            data: resp
          })
        })
      }
    },
    {
      method: 'GET',
      path: '/assets/{param*}',
      config: {
        description: 'Catch all assets file',
        auth: false,
        handler: {
          directory: {
            path: Path.join(__dirname, '../../../public/http-report/assets/'),
            listing: false,
            index: true
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/{p*}',
      config: {
        description: 'Catch all route to index.html',
        auth: false,
        handler: function (request, reply) {
          reply.file(Path.join(__dirname, '../../../public/http-report/index.html'))
        }
      }
    }
  ])

  return next()
}

exports.register.attributes = {
  name: 'http-report route',
  version: '1.0.1'
}
