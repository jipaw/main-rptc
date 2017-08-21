const Path = require('path')
const Glue = require('glue')
const Hoek = require('hoek')
const _ = require('lodash')

const manifest = require('./config/manifest')
const scheduler = require('./src/scheduler/jobs')

const options = {
  relativeTo: Path.join(__dirname, 'src')
}

if (process.env.NODE_ENV !== 'production') {
  manifest.registrations.push({
    plugin: 'blipp'
  })
}

Glue.compose(manifest, options, function (err, server) {
  Hoek.assert(!err, err)

  // scheduler.job1.start()
  // scheduler.job2.start()
  scheduler.job3.start()
  scheduler.job4.start()

  server.start(err => {
    Hoek.assert(!err, err)
    _.forEach(server.connections, function (connection) {
      console.log('Server started at: ' + connection.info.uri)
    })
  })
})
