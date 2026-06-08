// server.js - Custom startup file for cPanel Passenger
// This file is required by cPanel's "Setup Node.js App" (Phusion Passenger)
const { createServer } = require('http')
const { parse } = require('url')
const path = require('path')
const next = require('next')
const dotenv = require('dotenv')

// Load .env dari root folder aplikasi
dotenv.config({ path: path.join(__dirname, '.env') })

const dev = false // selalu production di server
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Al-Ittihad running on http://${hostname}:${port}`)
    })
})
