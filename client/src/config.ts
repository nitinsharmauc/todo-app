// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'cjq784os21'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-5o6hbdum.us.auth0.com',            // Auth0 domain
  clientId: 'LMCvXszcMxa2sjPjKb5sy1DR6ggcTME7',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
