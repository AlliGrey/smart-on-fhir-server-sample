Current state:

Endpoints:
/api/index : currently just return "index". Implementation is pending.
/ : currently just returns "Hello World". Part of a tutorial that I used and haven't removed yet.
/api/version : return the version of the application as determined in the package.json file.
/api/launch : returns an intermediate packet with information during intermediate calls to the Auth and Resource servers.

Docker is setup with internal port of 60702.
When run, external port needs to be specified as 60703: docker docker run -p 60703:60702 {image name}

I am using localtunnel to expose the endpoint. This is installed globally. See README.md here: https://github.com/localtunnel/localtunnel

I can currently get the response from my launch endpoint through initiating through the Cerner Developer Portal with my sample app.



TODO:
- Finish implementation of "index" section of code (exchanging auth code for token)
- Evaluate third party libray for OAuth calls?
- populate JWT with token and pass to client and initiate client call with jwt and have server unpack and use
- implement refresh token functionality
- move client out of gh-pages and into rendered from server (if any of that left at this point)