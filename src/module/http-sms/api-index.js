const Db = require('../../../config/db')
const aguid = require('aguid')
const Boom = require('boom')
const password = require('../../lib/pass')
const joiSchema = require('../../lib/schema')
const requestSchema = joiSchema.requestSchema
const rptRequestSchema = joiSchema.rptRequestSchema
const reqHelper = require('../../helper/request-builder')
const _ = require('lodash')
// const flat = require('flat')

/* CREDENTIAL POS
 * url : http://27.50.30.113:3000/smsgwpos/smsgws.aspx
 * token : 2894D2C1-D3BF-4D26-A5DB-D6792EECC672
 * userid : pos2017
 * pass : 2eB7z1
*/

exports.register = (server, options, next) => {
  server.route([{
    method: 'POST',
    path: '/smsgw/api-key',
    config: {
      description: 'Routes for generate uuid for user signature',
      handler: function (request, reply) {
        Db('users').where('username', request.payload.userid).select('*').asCallback((e, [user]) => {
          if (e) return (Boom.serverUnavailable('Resource unavailable'))
          if (!user) {
            return reply(Boom.unauthorized('Invalid user'))
          }
          password.validate(request.payload.pass, user.password, (res) => {
            if (!res) {
              return reply(Boom.unauthorized('Invalid credential'))
            }

            const key = aguid(user.username).toUpperCase()
            // const key = uuidV4().toUpperCase()
            Db('users').where('username', request.payload.userid).update({
              uuid: key
            }).then((result) => {
              console.log('UUID issued ', result)
              return reply({
                'rescode': '00',
                'status': 'OK',
                'token': key
              })
            }).catch((e) => reply(Boom.serverUnavailable('Resource unavailable')))
          })
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/smsgw/post',
    config: {
      description: 'Routes for handle send sms',
      handler: function (request, reply) {
/* validate data */
        Db('users').where('username', request.payload.smsRq.userid).select('*').asCallback((e, [result]) => {
          if (e) return (Boom.serverUnavailable())
          if (!result) {
            return reply(Boom.unauthorized('Invalid user'))
          } else {
            if (result.token < 1) {
              return reply(Boom.unauthorized('Insufficent token'))
            }

            const {msidn, message, userid, trxid, trxdate} = request.payload.smsRq
            /* send to vendor */
            const req = {
              userid: userid,
              trxid: trxid,
              msidn: msidn,
              message: message,
              trxdate: trxdate
            }
            const vend = reqHelper.chooseVendorByUser(req.userid)
            console.log(vend)
            reqHelper.buildRequest(vend, req, (response) => {
              /* get response */
              const data = response

              // console.log(data)
              /* reply to member */
              const res = {
                gwRes: {
                  data
                }
              }
              reply(res)
              // /* save to db */
              // Db.table('inbox_http').returning('in_seq').insert({
              //   userId: data.userid,
              //   msidn: data.msidn,
              //   message: data.message,
              //   trxid: data.trxid,
              //   status: data.status
              // }).then(function (result) {
              //   console.log('Trx in', result)
              //   return result
              // })
            })
          }
        })
      },
      validate: {
        payload: requestSchema
      }
    }
  },
  {
    method: 'POST',
    path: '/smsgw/rpt',
    config: {
      description: 'Routes for handle report sms',
      handler: function (request, reply) {
/* validate data */
        Db('users').where('username', request.payload.rptsmsgwRq.userid).select('*').asCallback((e, [result]) => {
          if (e) return (Boom.serverUnavailable())
          if (!result) {
            return reply(Boom.unauthorized('Invalid user'))
          } else {
            const {userid, type, periode} = request.payload.rptsmsgwRq
            /* send to vendor */
            const req = {
              userid: userid,
              type: type,
              periode: periode
            }
            const vend = reqHelper.chooseVendorByUser(req.userid)
            console.log(vend)
            reqHelper.buildRptRequest(vend, req, (response) => {
              /* get response */
              const rest = response
              let data = null
              // if (_.some(response, function (o) { return _.has(o, 'NewDataSet') })) {
              if (rest['soap:Envelope']['soap:Body'][0].smsrpt_summaryResponse[0].smsrpt_summaryResult[0]['diffgr:diffgram'].length > 0) {
                data = rest['soap:Envelope']['soap:Body'][0].smsrpt_summaryResponse[0].smsrpt_summaryResult[0]['diffgr:diffgram'][0].NewDataSet[0].Table
                /* reply to member */
                const res = {
                  rptsmsgwRs: {
                    data: data
                  }
                }
                reply(res)
              } else {
                data = 'No data'
                const res = {
                  rptsmsgwRs: {
                    data: data
                  }
                }
                return reply(res)
              }
            })
          }
        })
      },
      validate: {
        payload: rptRequestSchema
      }
    }
  }
  ])

  next()
}

exports.register.attributes = {
  name: 'HTTP-SMS Route',
  version: '1.0.0'
}
