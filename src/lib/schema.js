const Joi = require('joi')

const request = Joi.object({
  msidn: Joi.string().min(10).max(16).required(),
  message: Joi.string().min(1).max(320).required(),
  userid: Joi.string().min(3).max(18).required(),
  trxid: Joi.string().min(8).max(64).required(),
  trxdate: Joi.string().min(8).max(64).required(),
  sig: Joi.string().min(32).max(64).required()
})

const rptRequest = Joi.object({
  userid: Joi.string().min(3).max(18).required(),
  type: Joi.string().min(3).max(5).required(),
  periode: Joi.string().min(6).max(8).required()
})

module.exports.requestSchema = {
  smsRq: request
}

module.exports.rptRequestSchema = {
  rptsmsgwRq: rptRequest
}

module.exports.statusSchema = {
  user: Joi.string().min(3).max(18).required(),
  pass: Joi.string().min(4).max(18).required(),
  trxid: Joi.string().min(6).max(32).required(),
  date: [Joi.string().min(6).max(8)]

}

module.exports.keySchema = {
  user: Joi.string().required(),
  pass: Joi.string().required()
}
