import https from 'https'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).end(); return }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const useStream = body.stream !== false // default true, false only when explicitly set

  const outBody = JSON.stringify({ ...body, stream: useStream })

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(outBody),
    },
  }

  if (useStream) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
  }

  const request = https.request(options, (response) => {
    if (useStream) {
      response.on('data', (chunk) => { res.write(chunk) })
      response.on('end', () => { res.end() })
    } else {
      let data = ''
      response.on('data', (chunk) => { data += chunk })
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (response.statusCode !== 200) {
            const errInfo = `${response.statusCode} ${parsed?.error?.type || 'unknown'}: ${parsed?.error?.message || 'no message'}`
            console.error('[chat.mjs]', errInfo)
            res.status(response.statusCode).json({ error: errInfo, raw: parsed })
          } else {
            res.status(200).json(parsed)
          }
        }
        catch (e) { res.status(500).json({ error: 'Parse error: ' + e.message, raw: data.slice(0, 300) }) }
      })
    }
  })

  request.on('error', (err) => {
    res.status(500).json({ error: err.message })
  })

  request.write(outBody)
  request.end()
}
