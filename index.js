const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var express = require('express');
var app = express();

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  //res.setHeader('Upgrade','websocket');

  // Pass to next layer of middleware
  next();
});


// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/'];
//const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content),deletebatch,listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    'access_type':'offline',
    'response_type':'code',
    'client_id':'423393009196-kq8s6vh9fogvm0i8ct0v3odl58uqsgbj.apps.googleusercontent.com',
    'redirect_uri':'urn:ietf:wg:oauth:2.0:oob',
    'display':'page',
    'scope':'https://mail.google.com/'
    //scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

// var options = {
//   userId: 'me',
//   "resource": {
//     "ids": [
//       "rfc822msgid:0000000000007244290579ad164e@google.com",
//       "rfc822msgid:1767109781.0.1540553264207@Aitlp-65"
//     ]
//   }
// }

function deletebatch(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.messages.batchDelete({userId: "me","resource": {"ids": ["msg-f:1616022546710578069"]}}), 
    (err, res) => {
      if (err) {
          return console.log('The API returned an error: ' + err);
        }
        else {
          console.log({message : success},res);
        }
    };
  }

  // function execute(auth) {
  //   const gmail = google.gmail({version: 'v1', auth});
  //   var p1 = gmail.users.messages.batchDelete({
  //     "userId": "me",
  //     "resource": {
  //       "ids": [
  //         "rfc822msgid:0000000000007244290579ad164e@google.com"
  //       ]
  //     }
  //   })
  //       p1.then(function(response) {
  //               // Handle the results here (response.result has the parsed body).
  //               console.log("Response", response);
  //             },
  //             function(err) { console.error("Execute error", err); });
      
  // }

  // app.listen(3000, () => {
  //   console.log('JSON Server is running');
  // });