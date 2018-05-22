'use strict';
const express = require('express');
const morgan = require('morgan');
const nconf = require('nconf');
const pkg = require('./package.json');
const rp = require('request-promise');

nconf.argv().env('__');
nconf.defaults({conf: `${__dirname}/config.json`});
nconf.file(nconf.get('conf'));

const app = express();

let urlMap = {};


app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.get('/api/version', (req, res) => res.status(200).send(pkg.version));

/**
 * Index - This is in progress.
 * This will exchange the auth code for a token when implemented.
 */
app.get('/api/index', async (req, res) => {
  res.status(200).send("index");
  // try {
  //   const authorizationCode = req.query.code;
  //   const source = req.query.source;

  //   const metadataContext = {
  //     url: `${urlMap[source].iisUrl}/metadata`,
  //     headers: {
  //       'Accept': 'application/json'
  //     }
  //   };

  //   const metadataResponse = await rp(metadataContext);
  //   const tokenUrl = JSON.parse(metadataResponse).rest[0].security.extension[0].extension.filter(item => {
  //     return item.url === ("token")
  //   })[0].valueUri;

  //   const accessContext = {
  //     url: tokenUrl
  //   }

  //   return res.status(200).json({
  //     authorizationCode,
  //     tokenUrl
  //   });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).json(error);
  // }
});

/**
 * Launch - hitting secure and doing metadata call and authorize calls.
 */
app.get('/api/launch', async (req, res) => {
  try{
    const launchCode = req.query.launch;
    const issUrl = req.query.iss;
    const source = req.query.source;

    const metadataResponse = await rp({
      url: `${issUrl}/metadata`,
      headers: {
        'Accept': 'application/json'
      }
    });

    const authorizeUrl = JSON.parse(metadataResponse).rest[0].security.extension[0].extension.filter(item => {
      return item.url === ("authorize")
    })[0].valueUri;

    const authorizeContext = {
      url: authorizeUrl,
      qs: {
        response_type: 'code',
        client_id: '25fc3caf-b689-4fa7-a471-080a2bc675ac',
        launch: launchCode,
        //scope: 'patient/Patient.read patient/Observation.read user/Patient.read user/Observation.read launch online_access openid profile',
        scope: 'launch',
        aud: issUrl,
        redirect_uri: '',

      }
    };

    const authorizeResponse = await rp(authorizeContext);

    // Diagnostic information return value
    // return res.status(200).json({
    //   "source": source,
    //   "launchCode": launchCode,
    //   "issUrl": issUrl,
    //   "authorizeUrl": authorizeUrl,
    //   "authorizeResponse": authorizeResponse
    // });

    return res.status(200).send(authorizeResponse);
  } catch (err) {
    console.log("Error calling metadata endpoint.");
    return res.status(err.statusCode).json({
      "message": err.message
    });
  }
});

/**
 * This is currently set up to hit the open endpoint until I get the OAuth2 stuff working.
 */
app.get('/api/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  const authorizationCode = req.get("Authorization");

  console.log(`patientId: ${patientId}`);
  console.log(`authorizationCode: ${authorizationCode}`);

  var mkFhir = require('fhir.js');

  var client = mkFhir({
      baseUrl: 'https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca'
  });

  client
      .read({type: "Patient", id: patientId})
      .then(function(result){
        console.log(result);

        res.status(200).json({
          "patientId": patientId,
          "accessToken": authorizationCode,
          "data": result.data
        });
      })
      .catch(function(result){
          //Error responses
          if (result.status){
              console.log('Error', result.status);
          }

          //Errors
          if (result.message){
              console.log('Error', result.message);
          }

          res.status(502).json({
            "status": result.status,
            "message": result.message
          });
      });
})


app.listen(nconf.get('port'), () => console.log('Ready.'));

  // const launchCode = req.params.launch;
  // const iss = req.params.iss;

  // const options = {
  //   uri: `${iss}/metadata`,
  //   headers: {
  //     'Accept': 'application/json'
  //   }
  // }

  // const fhirServerInfo = rp(options);

//   res.status(200).send(true);
// });

/*
var config = {
  // FHIR server base url
  baseUrl: 'http://myfhirserver.com',
  auth: {
     bearer: 'token',
     // OR for basic auth
     user: 'user',
     pass: 'secret'
  },
  // Valid Options are 'same-origin', 'include'
  credentials: 'same-origin',
  headers: {
    'X-Custom-Header': 'Custom Value',
    'X-Another-Custom': 'Another Value',
  }
}

// create fhir instance
var fhir = jqFhir({
    baseUrl: 'https://ci-api.fhir.me',
    auth: {user: 'client', pass: 'secret'}
})


myClient = fhir(config, adapter)

var mkFhir = require('fhir.js');

var client = mkFhir({
    baseUrl: 'http://try-fhirplace.hospital-systems.com'
});

client
    .search( {type: 'Patient', query: { 'birthDate': '1974' }})
    .then(function(res){
        var bundle = res.data;
        var count = (bundle.entry && bundle.entry.length) || 0;
        console.log("# Patients born in 1974: ", count);
    })
    .catch(function(res){
        //Error responses
        if (res.status){
            console.log('Error', res.status);
        }

        //Errors
        if (res.message){
            console.log('Error', res.message);
        }
    });
*/