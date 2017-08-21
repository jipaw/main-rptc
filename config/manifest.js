module.exports = {
  server: {
    app: {
      slogan: 'GSERV SERVER'
    }
  },
  connections: [{
    port: 6680,
    labels: ['api']
  }],
  registrations: [
    {
      plugin: 'hapi-cors',
      options: {
        select: ['api']
      }
    },
    {
      plugin: 'inert',
      options: {
        select: ['api']
      }
    },
    {
      plugin: {
        register: 'good',
        options: {
          reporters: {
            myConsoleReport: [{
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{
                log: ['error', 'warn'],
                response: '*'
              }]
            },
            {
              module: 'good-console',
              args: [{ format: 'YYYYMMDD/HHmmss.SSS' }]
            },
              'stdout'
            ]
          }
        }
      }
    },
    {
      plugin: './module/http-sms/auth',
      options: {
        select: ['api']
      }
    },
    {
      plugin: './module/http-sms/api-index',
      options: {
        select: ['api']
      }
    },
    {
      plugin: './module/http-sms/http-report',
      options: {
        select: ['api']
      }
    },
    {
      plugin: './module/ip-filter/ipfilter',
      options: {
        select: ['api']
      }
    }
  ]
}
