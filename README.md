# salesforce-connected-app-oauth2-debugger

Finally a community Salesforce guide, that works! A minimalist tool for testing and debugging OAuth2 configurations for Salesforce Connected Apps rapidly.

This tool provides an interactive web interface and backend service (running on port 3000) to help you quickly validate OIDC metadata, construct authorization requests with PKCE support 😲, and exchange authorization codes for tokens. The easily extendable, one-page frontend, styled with Tailwind CSS   <-- 🏓 communicates bidirectionally 🏓 --> with the backend via WebSocket, making it easy to see responses in real-time while keeping data private.

Key features include:
- fetching OIDC metadata from your connected app’s well-known endpoint
- interactive forms to configure OAuth2 parameters (client ID, secret, callback URL, etc.)
- automated & offline generation of PKCE code challenges and verifiers
- constructing authorization URLs and handling callback redirects
- debugging token requests with raw JSON responses

Run it locally to streamline your Salesforce OAuth2 connection settings and configuration.

#### TO RUN LOCALLY :
```
npm i
npx tsc
node dist/index.js
```


#### EXAMPLE USAGE..

#### 1) Enter your `*.../.well-known/openid-configuration*` URL to autopopulate available options. Then Click 'Send'.

![Step 1](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--hvkDxA8E--/v1739395666/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/uphvd06eyctym0azddy4.png)

#### 2. Enter the client_id (Consumer Key) and, if required, the client_secret (Consumer Secret) based on your app configuration, as seen in yellow.
 ![Step 2](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--jHJia56k--/v1739395941/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/pi3jhv833xcuoct9msi3.png)

#### 3) Click "Generate PKCE"
![Generate a PKCE ](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--MB_dvMDA--/v1739396074/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/vjdl6lpfhekdfbuhto1f.png)

#### 4. Click "Construct Request" and follow the link "Authorize with Salesforce" to authenticate and return to the callback URL (this app listens for http://localhost:3000/callback, this must match your Connected App config. See bottom Set-up.)
![authorize](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--ve-KIpR1--/v1739403833/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/dugxz8rrj709ckbcvlay.png)

#### 5. Get Authorization Code. Paste the code and click 'Exchange for Token'.
![Authenticate](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--RYQAN1Au--/v1739398034/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/xhjjlkh8unhfakqueqxt.png)

#### 6. a. Get Result (access || id) token on success.
![Get Token](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--J8h5J2Ah--/v1739397996/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/jmvqq5q9r5e9swgxunai.png)

#### 6. b. Errors are returned as well.
![err example](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--_8XGDKgT--/v1739397253/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/uvqjvpzumpq7boblxg0j.png)



#### EXAMPLE SETUP

![app creation -  Choose OAuth 2.0](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--Vh__i0SQ--/v1739396592/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/xjjz3eqgguqyt6qjan4x.png)


![App info](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--OgdU0dLz--/v1739396624/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/temtbdh8i4qx6zipex6q.png)


![Edit App View - Edit Callback URLl](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--sMhN75-d--/v1739398428/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/gfzyx4hxepufqbp7gfej.png)



![App Overview - OAuth Settings](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--jGgRGOeZ--/v1739404729/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/dzj0q4lz00aahr8opzv0.png)
####  Require Client Secret Selection (Is this app Public / Private?)
https://help.salesforce.com/s/articleView?id=xcloud.configure_oauth_code_credentials_flow_external_client_apps.htm&type=5#:~:text=If%20you%E2%80%99re%20using,to%20the%20browser.

![App Overview Bottom - Required Secret Location](https://res.cloudinary.com/dxrtrkhvl/image/authenticated/s--RZI3sTRx--/v1739405014/ef874c8c-e89e-486e-9f98-69e676f8bd99-473c0b64-5c6e-4f92-b64d-38571abfbbb1-21edba31-edb4-4c77-b6f1-22729aac4b14/a8tuyijxfion2wn21fp8.png)


Open to pull requests, or feature requests. If this helped throw me a star! If you are Salesforce, throw me a job!

Cheers!
