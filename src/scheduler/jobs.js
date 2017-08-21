const cron = require('cron')
const moment = require('moment')
const Knex = require('../../config/db')
const reqHelper = require('../helper/request-builder')
const _ = require('lodash')
const flat = require('flat')
// const Wreck = require('wreck')
const dummyData = [
  { product: ['INDOSAT SMS'], total: ['0'], Status: ['SUCCEED'] },
  { product: ['TELKOMSEL SMS'], total: ['0'], Status: ['FAILED'] },
  { product: ['OTHER SMS'], total: ['0'], Status: ['SUCCEED'] },
  { product: ['THREE SMS'], total: ['0'], Status: ['SUCCEED'] },
  { product: ['SMARTFREN SMS'], total: ['0'], Status: ['SUCCEED'] },
  { product: ['USSD SMS'], total: ['0'], Status: ['SUCCEED'] },
  { product: ['XL SMS'], total: ['0'], Status: ['FAILED'] }
]

let job = new cron.CronJob({
  cronTime: '02 0 * * *',
  onTick: function () {
    console.log('start daily log table log_sms')
    let myTime = moment().subtract(1, 'days').format('YYYYMMDD')
    let today = moment().subtract(1, 'days').format('YYYY-MM-DD')
    Knex('users').select('username').asCallback((e, member) => {
      if (e) return console.error(e)
      for (let i = 0; i < member.length; i++) {
        // start query to count records
        const username = member[i].username
        const vendor = reqHelper.chooseVendorByUser(username)
        const req = {
          userid: username,
          periode: myTime
        }
        reqHelper.buildRptRequest(vendor, req, (response) => {
          /* get response */
          let user = username
          let data = response
          let flattenData = flat(data)
          let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summaryResponse.0.smsrpt_summaryResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
          // console.log(data2)
          if (!newDataSet) {
            const data = dummyData
            for (let j = 0; j < data.length; j++) {
              let product = data[j].product[0]
              let total = data[j].total[0]
              Knex('sms_record').where('user_name', user).insert({
                user_name: user,
                count_date: today,
                count_time: 0,
                product: product,
                count_request: parseInt(total),
                request: 0,
                success: 0,
                failed: 0
              }).asCallback((e, result) => {
                if (e) return console.error(e)
                return console.log(result)
              })
            }
            return null
          }
          data = data['soap:Envelope']['soap:Body'][0].smsrpt_summaryResponse[0].smsrpt_summaryResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
          /* reply to member */
          console.log(data)
          for (let j = 0; j < data.length; j++) {
            let product = data[j].product[0]
            let total = data[j].total[0]
            Knex('sms_record').where('user_name', user).insert({
              user_name: user,
              count_date: today,
              count_time: 0,
              product: product,
              count_request: parseInt(total),
              request: 0,
              success: 0,
              failed: 0
            }).asCallback((e, result) => {
              if (e) return console.error(e)
              return console.log(result)
            })
          }
        })
      }
    })
  },
  start: false,
  timeZone: 'Asia/Jakarta'})

let job2 = new cron.CronJob({
  cronTime: '0 * * * *',
  onTick: function () {
    console.log('start hourly log table log_sms')
    let myTime = moment().format('YYYY-MM-DD')
    let periode = moment().format('YYYYMMDD')
    let currentTime = moment().format('HH:[00:00]')
    let pastTime = moment().subtract(1, 'hours').format('HH:[00:00]')

    Knex('users').select('username').asCallback((e, member) => {
      if (e) return console.error(e)
      for (let i = 0; i < member.length; i++) {
        // start query to count records
        const username = member[i].username
        const vendor = reqHelper.chooseVendorByUser(username)
        const req = {
          userid: username,
          pastTime: pastTime,
          periode: periode
        }

        reqHelper.buildRptRequest(vendor, req, (response) => {
          /* get response */
          let user = username
          let data = response
          let flattenData = flat(data)
          let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summaryResponse.0.smsrpt_summaryResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
          if (!newDataSet || currentTime === '00:00:00') {
            data = dummyData
          } else {
            data = data['soap:Envelope']['soap:Body'][0].smsrpt_summaryResponse[0].smsrpt_summaryResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
          }
          console.log(data)
          for (let j = 0; j < data.length; j++) {
            let product = data[j].product[0]
            let total = data[j].total[0]
            // let counter = 1
            // console.log(total)
            Knex('sms_record').select('request', 'count_request').where('count_time', pastTime).andWhere('count_date', myTime).andWhere('user_name', user).andWhere('product', product).asCallback((e, [result]) => {
              if (e) return console.error(e)
              console.log('result', result)
              let lastRequest = 0
              if (result !== undefined) {
                if (currentTime === '00:00:00') {
                  lastRequest = 0
                } else {
                  lastRequest = result.count_request
                }
                console.log('lastRequest ', lastRequest)
                let totalRequest = parseInt(total) - parseInt(lastRequest)
                Knex('sms_record').insert({
                  user_name: user,
                  count_date: myTime,
                  count_time: currentTime,
                  product: product,
                  count_request: parseInt(total),
                  request: totalRequest,
                  success: 0,
                  failed: 0
                }).asCallback((e, result) => {
                  if (e) return console.error(e)
                  return console.log(result)
                })
              } else {
                if (result === undefined) {
                  setTimeout(() => {
                    Knex('sms_record').select('request', 'count_request').where('count_time', pastTime).andWhere('count_date', myTime).andWhere('user_name', user).andWhere('product', product).asCallback((e, [result]) => {
                      if (currentTime === '00:00:00') {
                        lastRequest = 0
                      } else {
                        lastRequest = result.count_request
                      }
                      console.log('lastRequest ', lastRequest)
                      let totalRequest = parseInt(total) - parseInt(lastRequest)
                      Knex('sms_record').insert({
                        user_name: user,
                        count_date: myTime,
                        count_time: currentTime,
                        product: product,
                        count_request: parseInt(total),
                        request: totalRequest,
                        success: 0,
                        failed: 0
                      }).asCallback((e, result) => {
                        if (e) return console.error(e)
                        return console.log(result)
                      })
                    })
                  }, 5000)
                }
              }
            })
          }
        })
      }
    })
  },
  start: false,
  timeZone: 'Asia/Jakarta'})

let job3 = new cron.CronJob({
  cronTime: '0 * * * *',
  onTick: function () {
    console.log('test scheduler')
    let today = moment().format('YYYY-MM-DD')
    let periode = moment().format('YYYYMMDD')
    let currentTime = moment().format('HH:[00:00]')
    let pastTime = moment().subtract(1, 'hours').format('HH:[00:00]')

    setTimeout(() => {
      console.log('start query users')
      Knex('users').select('username').asCallback((e, user) => {
        if (e) return console.error(e)
        for (let i = 0; i < user.length; i++) {
          const username = user[i].username
          console.log(username)
          Knex.insert([{user_name: username, product: 'INDOSAT SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'TELKOMSEL SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'XL SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'OTHER SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'SMARTFREN SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'THREE SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'USSD SMS', count_date: today, count_time: currentTime}]).into('sms_record').then((result) => {
            return console.log(result)
          })
        }
      })

      function next () {
        console.log('start update query sms_record')

        Knex('users').select('username').asCallback((e, user) => {
          if (e) return console.error(e)
          for (let i = 0; i < user.length; i++) {
            const username = user[i].username
            const vendor = reqHelper.chooseVendorByUser(username)
            const req = {
              userid: username,
              startDate: periode,
              endDate: periode
            }
            reqHelper.buildRptRequestByRange(vendor, req, (response) => {
              /* get response */
              let data = response
              let flattenData = flat(data)
              let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summary_dateResponse.0.smsrpt_summary_dateResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
              if (!newDataSet || currentTime === '00:00:00') {
                data = dummyData
              } else {
                data = response['soap:Envelope']['soap:Body'][0].smsrpt_summary_dateResponse[0].smsrpt_summary_dateResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
              }
              console.log(data)
              for (let i = 0; i < data.length; i++) {
                let product = 'OTHER SMS'
                if (_.has(data[i], 'product')) {
                  product = data[i].product[0]
                }
                let status = data[i].Status[0]
                let total = data[i].total[0]
                let lastRequest = 0
                console.log(status)
                Knex('sms_record').select('request', 'success').where('count_time', pastTime).andWhere('count_date', today).andWhere('user_name', username).andWhere('product', product).asCallback((e, [result]) => {
                  if (e) console.error(e)
                  console.log(result)
                  if (currentTime === '00:00:00') {
                    lastRequest = 0
                  } else {
                    lastRequest = parseInt(result.success)
                  }
                  console.log('lastRequest ', lastRequest)
                  if (status === 'FAILED') {
                    let totalFailed = parseInt(total)
                    Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                      failed: totalFailed
                    }).then((result) => console.log(result)).catch((e) => console.log(e))
                  }
                  if (status === 'SUCCEED' || status === 'DELIVERED') {
                    let totalSuccess = parseInt(total)
                    Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                      success: totalSuccess,
                      request: totalSuccess - lastRequest,
                      count_request: Knex.raw('failed + success')
                    }).then((result) => console.log(result)).catch((e) => console.log(e))
                  }
                  Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                    count_request: Knex.raw('failed + success')
                  }).then((result) => console.log(result)).catch((e) => console.log(e))
                })
              }
            })
          }
        })
      }
      setTimeout(() => {
        next()
      }, 5000)
    }, 1000)
  },
  start: false,
  timeZone: 'Asia/Jakarta'})

let job4 = new cron.CronJob({
  cronTime: '1 0 * * *',
  onTick: function () {
    console.log('start daily log table log_sms')
    let today = moment().subtract(1, 'days').format('YYYY-MM-DD')
    let periode = moment().subtract(1, 'days').format('YYYYMMDD')
    let currentTime = '0'

    setTimeout(() => {
      console.log('start query users')
      Knex('users').select('username').asCallback((e, user) => {
        if (e) return console.error(e)
        for (let i = 0; i < user.length; i++) {
          const username = user[i].username
          console.log(username)
          Knex.insert([{user_name: username, product: 'INDOSAT SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'TELKOMSEL SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'XL SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'OTHER SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'SMARTFREN SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'THREE SMS', count_date: today, count_time: currentTime}, {user_name: username, product: 'USSD SMS', count_date: today, count_time: currentTime}]).into('sms_record').then((result) => {
            return console.log(result)
          })
        }
      })

      function next () {
        console.log('start update query sms_record')

        Knex('users').select('username').asCallback((e, user) => {
          if (e) return console.error(e)
          for (let i = 0; i < user.length; i++) {
            const username = user[i].username
            const vendor = reqHelper.chooseVendorByUser(username)
            const req = {
              userid: username,
              startDate: periode,
              endDate: periode
            }
            reqHelper.buildRptRequestByRange(vendor, req, (response) => {
              /* get response */
              let data = response
              let flattenData = flat(data)
              let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summary_dateResponse.0.smsrpt_summary_dateResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
              if (!newDataSet || currentTime === '00:00:00') {
                data = dummyData
              } else {
                data = response['soap:Envelope']['soap:Body'][0].smsrpt_summary_dateResponse[0].smsrpt_summary_dateResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
              }
              console.log(data)
              for (let i = 0; i < data.length; i++) {
                let product = 'OTHER SMS'
                if (_.has(data[i], 'product')) {
                  product = data[i].product[0]
                }
                let status = data[i].Status[0]
                let total = data[i].total[0]
                console.log(status)
                if (status === 'FAILED') {
                  let totalFailed = parseInt(total)
                  Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                    failed: totalFailed,
                    count_request: Knex.raw('failed + success')
                  }).then((result) => console.log(result)).catch((e) => console.log(e))
                }
                if (status === 'SUCCEED' || status === 'DELIVERED') {
                  let totalSuccess = parseInt(total)
                  Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                    success: totalSuccess,
                    count_request: Knex.raw('failed + success')
                  }).then((result) => console.log(result)).catch((e) => console.log(e))
                }
                Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                  count_request: Knex.raw('failed + success')
                }).then((result) => console.log(result)).catch((e) => console.log(e))
              }
            })
          }
        })
      }
      setTimeout(() => {
        next()
      }, 5000)
    }, 1000)
  },
  start: false,
  timeZone: 'Asia/Jakarta'})

let job5 = new cron.CronJob({
  cronTime: '25 12 * * *',
  onTick: function () {
    console.log('start daily log table log_sms')
    let today = moment().subtract(12, 'days').format('YYYY-MM-DD')
    let periode = moment().subtract(12, 'days').format('YYYYMMDD')
    let currentTime = '0'

    setTimeout(() => {
      function next () {
        console.log('start update query sms_record')

        Knex('users').select('username').asCallback((e, user) => {
          if (e) return console.error(e)
          for (let i = 0; i < user.length; i++) {
            const username = user[i].username
            const vendor = reqHelper.chooseVendorByUser(username)
            const req = {
              userid: username,
              startDate: periode,
              endDate: periode
            }
            reqHelper.buildRptRequestByRange(vendor, req, (response) => {
              /* get response */
              let data = response
              let flattenData = flat(data)
              let newDataSet = _.has(flattenData, 'soap:Envelope.soap:Body.0.smsrpt_summary_dateResponse.0.smsrpt_summary_dateResult.0.diffgr:diffgram.0.NewDataSet.0.$.xmlns')
              if (!newDataSet || currentTime === '00:00:00') {
                data = dummyData
              } else {
                data = response['soap:Envelope']['soap:Body'][0].smsrpt_summary_dateResponse[0].smsrpt_summary_dateResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
              }
              console.log(data)
              for (let i = 0; i < data.length; i++) {
                let product = 'OTHER SMS'
                if (_.has(data[i], 'product')) {
                  product = data[i].product[0]
                }
                let status = data[i].Status[0]
                let total = data[i].total[0]
                console.log(status)
                if (status === 'FAILED') {
                  let totalFailed = parseInt(total)
                  Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                    failed: totalFailed,
                    count_request: Knex.raw('failed + success')
                  }).then((result) => console.log(result)).catch((e) => console.log(e))
                }
                if (status === 'SUCCEED' || status === 'DELIVERED') {
                  let totalSuccess = parseInt(total)
                  Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                    success: totalSuccess,
                    count_request: Knex.raw('failed + success')
                  }).then((result) => console.log(result)).catch((e) => console.log(e))
                }
                Knex('sms_record').where('product', product).andWhere('user_name', username).andWhere('count_date', today).andWhere('count_time', currentTime).update({
                  count_request: Knex.raw('failed + success')
                }).then((result) => console.log(result)).catch((e) => console.log(e))
              }
            })
          }
        })
      }
      setTimeout(() => {
        next()
      }, 500)
    }, 100)
  },
  start: false,
  timeZone: 'Asia/Jakarta'})

module.exports.job1 = job
module.exports.job2 = job2
module.exports.job3 = job3
module.exports.job4 = job4
module.exports.job5 = job5
