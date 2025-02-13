import express from 'express';
import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import path from 'path';
import { createServer } from 'http';

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.get('/', (req, res) => {
    console.log(req.query)
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const input = message.toString().trim();
        // If input is a URL that includes .well-known or looks like an OIDC well-known
        if (input.startsWith('https://') && input.includes('.well-known')) {
            // Spawn curl
            const curl = spawn('curl', ['-s', input]);
            let responseData = '';
            curl.stdout.on('data', (data) => {
                responseData += data.toString();
            });
            curl.stdout.on('end', () => {
                try {
                    // Attempt to parse as OIDC metadata JSON
                    const parsed = JSON.parse(responseData);
                    // Return the entire JSON to the UI under data.oidcMetadata
                    ws.send(JSON.stringify({
                        response: "OIDC metadata fetched successfully.",
                        oidcMetadata: parsed,
                        nextPrompt: "Enter next command"
                    }));
                } catch (err) {
                    ws.send(JSON.stringify({
                        response: `Failed parsing OIDC well-known as JSON:\n${responseData}`,
                        nextPrompt: "Enter next command"
                    }));
                }
            });

            curl.stderr.on('data', (errorData) => {
                ws.send(JSON.stringify({
                    response: `Error fetching .well-known:\n${errorData.toString()}`,
                    nextPrompt: "Enter next command"
                }));
            });
        }
        else if (input.startsWith('https://')) {
            const curl = spawn('curl', ['-s', input]);
            let responseData = '';
            curl.stdout.on('data', (data) => {
                responseData += data.toString();
            });
            curl.stdout.on('end', () => {
                ws.send(JSON.stringify({
                    response: responseData,
                    nextPrompt: "Enter next command"
                }));
            });
            curl.stderr.on('data', (errorData) => {
                ws.send(JSON.stringify({
                    response: `Error: ${errorData.toString()}`,
                    nextPrompt: "Enter next command"
                }));
            });
        }
        if (input.startsWith('fetch_token=')) {
            const jsonPart = input.replace('fetch_token=', '');
            let payload;
            try {
                payload = JSON.parse(jsonPart);
            } catch (e) {
                ws.send(JSON.stringify({
                    response: `Failed to parse fetch_token JSON: ${e}`,
                    nextPrompt: 'Enter next command'
                }));
                return;
            }

            // We'll expect these fields change as needed.
            // code and code_verifier required for Authorization Code Flow.
            const {
                code,
                code_verifier,
                token_url,
                client_id,
                client_secret,
                redirect_uri
            } = payload;

            if (!code || !code_verifier || !token_url || !client_id || !redirect_uri) {
                ws.send(JSON.stringify({
                    response: 'Missing required fields in fetch_token payload. Must have code, code_verifier, token_url, client_id, redirect_uri.',
                    nextPrompt: 'Enter next command'
                }));
                return;
            }

            const curlArgs = [
                '-s',
                '-X', 'POST',
                token_url,
                '-H', 'Content-Type: application/x-www-form-urlencoded',
                '--data-urlencode', 'grant_type=authorization_code',
                '--data-urlencode', `code=${code}`,
                '--data-urlencode', `code_verifier=${code_verifier}`,
                '--data-urlencode', `client_id=${client_id}`,
                '--data-urlencode', `client_id=${client_secret}`,
                '--data-urlencode', `redirect_uri=${redirect_uri}`

            ];

            console.log("Executing cURL request:", curlArgs.join(" "));


            if (client_secret) {
                curlArgs.push('--data-urlencode', `client_secret=${client_secret}`);
            }
            const curl = spawn('curl', curlArgs);
            let responseData = '';

            curl.stdout.on('data', (chunk) => {
                responseData += chunk.toString();
            });

            curl.stdout.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    // Return the parsed token payload
                    ws.send(JSON.stringify({
                        response: 'Successfully fetched token.',
                        tokenResponse: parsed,
                        nextPrompt: 'Enter next command'
                    }));
                } catch (err) {
                    // Not JSON or parse error
                    ws.send(JSON.stringify({
                        response: `Raw token response:\n${responseData}`,
                        nextPrompt: 'Enter next command'
                    }));
                }
            });

            curl.stderr.on('data', (errData) => {
                ws.send(JSON.stringify({
                    response: `Error fetching token:\n${errData.toString()}`,
                    nextPrompt: 'Enter next command'
                }));
            });
        }
        else if (input === 'construct request') {
            // Existing logic for building cURL or PKCE flows
            ws.send(JSON.stringify({
                response: "Constructing request ...",
                // etc.
            }));
        }
        else {
            // Any other input
            // For example, default to GitHub call or echo
            ws.send(JSON.stringify({
                response: "Fallback or debug message",
                nextPrompt: "Enter next command"
            }));
        }
    });
});
app.get('/callback', (req, res) => {
    const code = req.query.code || '';
    const state = req.query.state || '';

    // Display a minimal HTML page telling the user to copy the code
    res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>OAuth Callback</title></head>
      <body style="font-family: sans-serif;">
        <h1>OAuth Callback</h1>
        <p>Salesforce redirected you back here with a <code>code</code> parameter.</p>
        <p><strong>Authorization Code:</strong></p>
        <textarea rows="3" cols="80">${code}</textarea>
        <p>If you have a separate UI to xchange the code, copy & epaste it there.</p>
        <p><strong>State:</strong> ${state}</p>
        <button onclick="window.close()">Close Window</button>
      </body>
    </html>
    `);
})
// app.get('/return', (req, res) => {
//     const code = req.query || '';
//     const state = req.query.state || '';

//     // Display a minimal HTML page telling the user to copy the code
//     res.send(`
//     <!DOCTYPE html>
//     <html>
//       <head><title>OAuth Callback</title></head>
//       <body style="font-family: sans-serif;">
//         <h1>OAuth Callback</h1>
//         <p>Salesforce redirected you back here with a <code>code</code> parameter.</p>
//         <p><strong>Authorization Code:</strong></p>
//         <textarea rows="3" cols="80">${code}</textarea>
//         <p>If you have a separate UI to xchange the code, copy & epaste it there.</p>
//         <p><strong>State:</strong> ${state}</p>
//         <button onclick="window.close()">Close Window</button>
//       </body>
//     </html>
//     `);
// })

// app.post('/return', (req, res) => {
//     const code = req.query || '';
//     const state = req.body.state || '';

//     // Display a minimal HTML page telling the user to copy the code
//     res.send(`
//     <!DOCTYPE html>
//     <html>
//       <head><title>OAuth Callback</title></head>
//       <body style="font-family: sans-serif;">
//         <h1>OAuth Callback</h1>
//         <p>Salesforce redirected you back here with a <code>code</code> parameter.</p>
//         <p><strong>Authorization Code:</strong></p>
//         <textarea rows="3" cols="80">${code}</textarea>
//         <p>If you have a separate UI to xchange the code, copy & epaste it there.</p>
//         <p><strong>State:</strong> ${state}</p>
//         <button onclick="window.close()">Close Window</button>
//       </body>
//     </html>
//     `);
// })
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
