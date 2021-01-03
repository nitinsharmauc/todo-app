import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-5o6hbdum.us.auth0.com/.well-known/jwks.json'
const jwksUrl = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJbFdqMGeAAZYpMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi01bzZoYmR1bS51cy5hdXRoMC5jb20wHhcNMjEwMTAyMTIwODU5WhcN
MzQwOTExMTIwODU5WjAkMSIwIAYDVQQDExlkZXYtNW82aGJkdW0udXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArirJ/TVeFe6tih2q
+qCcVvZJdT7TqOkHP7g6E0yMpa+Yv5z6JcKQbpRFd8CQQXhsOYnce8VPZa1UW76X
mcjH9tPDcIVsl06AYzAsKiisgIjXg8a9g4TXr19T1Z5HB72BHLI/u6GmaW6g9Iul
fDCEvm7QdvNLxHzvMcmLc6TsKgbCkQLVjX4yfXEZcbbNGsj1irxKdwrDJUSHVMQP
3QSjFrvu/O+qOyOpwNFP889QQfg5Hqt4iGODmHd2fLZVu44vX+Y1D6dQGmrflq95
65ISzMeNYUSQalc7cbHXXTPe/fCpqji++1nuS/7DvpyYrmbJ85d9hR/Fe9lnpQ+z
6ELlvQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQXfZHChFAG
9xXXDGrBLsUQNBP+KTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AKAzjUlArmXnH9AP60uWgR4tZmPYkeTGSyqhbC+mPE6x6MvCJ616OJxzvxYmvoEC
xt4HWfN5CE2xT5QIDx9JGs79ZXk3DgN/MI5isptHTXaKh+qPJmP3lVHWb3SeyUV0
zy/KVdqCsKwVxabt7Rr5i6NgL1y9kQMOx0GVrC/M/DEazGByYkYGyK814gKckI5N
NwwOW5HnOLAilPn/Bf43mdQ/evQpiX02rYmSdn0S/kB77qDB+mZUtUqAu7xo3wcA
x3L01JzIn6KVllQyhzfG0oLnXzH3kqeDLoXHjtPIUdwtYVZrG5Qa9Q5mOMTzBsDV
teZjk26Q6QPyUjbr0oq6I1M=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, jwksUrl, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
