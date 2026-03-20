const https = require('https')

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).end(); return }

  let bodyStr
  try {
    bodyStr = JSON.stringify(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
  } catch(e) {
    res.status(400).json({ error: 'Bad request body: ' + e.message })
    return
  }

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(bodyStr),
    },
  }

  const request = https.request(options, (response) => {
    let data = ''
    response.on('data', chunk => { data += chunk })
    response.on('end', () => {
      try {
        res.status(200).json(JSON.parse(data))
      } catch(e) {
        res.status(500).json({ error: 'Parse error: ' + e.message, raw: data })
      }
    })
  })

  request.on('error', (err) => {
    res.status(500).json({ error: 'Request error: ' + err.message })
  })

  request.write(bodyStr)
  request.end()
}
