import express from 'express'
import socketIo from 'socket.io'
import * as http from 'http'
import morgan from 'morgan'
import * as _ from 'lodash'
import bodyParser from 'body-parser'

import task from './fixtures/task'
import actor from './fixtures/actor'

const app = express()
const server = http.createServer(app)
const port = 3000

const BALENA_DEVICE_UUID = process.env.BALENA_DEVICE_UUID

// Add logging to stdout for server requests
app.use(morgan('combined'))

// parse application/json
app.use(bodyParser.json())

//--------------
// Route stubs
//--------------

app.get('/', (_req, res) => {
  res.send('Jellyfish stub')
})

app.get('/api/v2/config', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/health', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/status', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/ping', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/api/v2/registry', async (_request, response) => {
  return response.sendStatus(501)
})

app.get('/api/v2/oauth/:provider/:slug', (_request, response) => {
  return response.sendStatus(501)
})

app.post('/api/v2/oauth/:provider', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/oauth/:provider', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/api/v2/type/:type', async (_request, response) => {
  return response.sendStatus(501)
})

app.get('/api/v2/id/:id', async (request, response) => {
  const fixtures = [
    task,
    actor,
  ]

  const result = _.find(fixtures, { id: request.params.id })

  if (result) {
    return response.status(200).json(result)
  }

  return response.sendStatus(501)
})

app.get('/api/v2/slug/:slug', async (_request, response) => {
  return response.sendStatus(501)
})

app.all('/api/v2/hooks/:provider/:type*?', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/api/v2/file/:cardId/:fileName', async (_request, response) => {
  return response.sendStatus(501)
})

app.post('/api/v2/action', async (request, response) => {
  const payload = request.body

  if (payload.action === 'action-create-card@1.0.0') {
    if (payload.card === 'session@1.0.0') {
      return response.status(200).json({
        error: false,
        data: {
          id: 'c576c994-56be-4a9a-af43-67541ff37843',
          slug: 'session-foo',
          type: 'session@1.0.0',
          version: '1.0.0'
        },
        timestamp: new Date().toISOString()
      })
    }
  }
  return response.sendStatus(501)
})

app.post('/api/v2/query', async (_request, response) => {
  return response.sendStatus(501)
})

app.post('/api/v2/view/:slug', (_request, response) => {
  return response.sendStatus(501)
})

app.get('/api/v2/whoami', async (_request, response) => {
  const slug = `transformer-worker-${BALENA_DEVICE_UUID}`
  return response.status(200).json({
    error: false,
    data: {
      id: '1111-1111-1111-1111',
      slug
    }
  })
})

app.post('/api/v2/signup', async (_request, response) => {
  return response.sendStatus(501)
})

//--------------
// Socket server
//--------------

const socketServer = socketIo(server, {
  pingTimeout: 60000,
  transports: [ 'websocket', 'polling' ]
})

socketServer.on('connection', (socket: any) => {
  socket.setMaxListeners(50)

  // The query property can be either a JSON schema, view ID or a view card
  socket.on('query', (payload: any) => {
    if (!payload.token) {
      return socket.emit({
        error: true,
        data: 'No session token'
      })
    }

    setTimeout(() => {
      socket.emit('update', {
        error: false,
        data: {
          after: task,
          type: 'update'
        }
      })
    }, 500)

    socket.emit('ready')
  })
})

server.listen(port, () => {
  console.log(`Jellyfish stub listening at http://localhost:${port}`)
})
