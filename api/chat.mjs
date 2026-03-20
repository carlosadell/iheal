import https from 'https'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).end(); return }

  const bodyStr = JSON.stringify(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)

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
      try { res.status(200).json(JSON.parse(data)) }
      catch(e) { res.status(500).json({ error: 'Parse error: ' + e.message }) }
    })
  })
  request.on('error', (err) => res.status(500).json({ error: err.message }))
  request.write(bodyStr)
  request.end()
}
