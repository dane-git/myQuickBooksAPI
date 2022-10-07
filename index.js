
require('dotenv').config();
const express = require('express')
const util = require('util')



const PORT = process.env.PORT || 5000;
const app = express();

const OAuthClient = require('intuit-oauth');

app.use(express.json())

let oauth2_token_json = null;
let redirectUri = '';
let oauthClient = null;


const auth_token = {
  token_type: "bearer",
  access_token: process.env.REFRESH_ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN,
  // x_refresh_token_expires_in: 8726362,
  created_at: process.env.TOKEN_CREATEDAT,


}
let TOKEN = null
const companyid = process.env.REALM_ID
const minorversion = 14

console.log('REFRESH_ACCESS_TOKEN', process.env.REFRESH_ACCESS_TOKEN)
console.log()

oauthClient = new OAuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  environment: process.env.ENVIRONMENT,
  redirectUri: process.env.REDIRECT_URI,
  token: auth_token,
  logging: true
});
// oauthClient.setToken(process.env.REFRESH_ACCESS_TOKEN);
const authUri = oauthClient.authorizeUri({
  scope: [OAuthClient.scopes.Accounting],
  state: 'intuit-test',
});
console.log(authUri)

oauthClient
  .validateIdToken()
  .then(function (response) {
    console.log('Is my ID token validated  : ' + response);
  })
  .catch(function (e) {
    console.log('The error is ' + JSON.stringify(e));
  });


console.log(oauthClient.token)
console.log(TOKEN)
// res.send(authUri);



app.get('/callback', function (req, res) {
  console.log('in callback'.repeat(3))
  oauthClient
    .createToken(req.url)
    .then(function (authResponse) {
      oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
    })
    .catch(function (e) {
      console.error(e);
    });

  res.send('');
});


app.get('/refreshAccessToken', function (req, res) {
  console.log("CORRECT FILE")
  oauthClient
    .refresh()
    .then(function (authResponse) {
      console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
      oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
      res.send(oauth2_token_json);
    })
    .catch(function (e) {
      console.error(e);
    });
});

app.get('/newRefreshToken', (req, res) => {
  console.log('dakjdflkdafskjhdksmndlkjfna.,k,m')
  oauthClient
    .refreshUsingToken(process.env.REFRESH_TOKEN)
    .then(function (authResponse) {
      console.log('Tokens refreshed : ' + JSON.stringify(authResponse.getJson()));
    })
    .catch(function (e) {
      console.error('The error message is :' + e.originalMessage);
      console.error(e.intuit_tid);
    });
})


app.get('/getCompanyInfo', function (req, res) {
  console.log('in getCompanyInfo')
  // const companyID = oauthClient.getToken().realmId;
  const companyID = process.env.REALM_ID

  const url =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  console.log('URL: ', url)

  oauthClient
    .makeApiCall({ url: `${url}v3/company/${companyID}/companyinfo/${companyID}` })
    .then(function (authResponse) {
      console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
      res.send(JSON.parse(authResponse.text()));
    })
    .catch(function (e) {
      console.error(e);
    });
});



/**
 * Display the token : CAUTION : JUST for sample purposes
 */
app.get('/retrieveToken', (req, res) => {
  console.log(oauth2_token_json)
  res.send(oauth2_token_json);
});



//------------------------------ Account ------------------------------ )
app.post('/accountCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "AccountType": "Accounts Receivable",
    "Name": "AR4"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/account?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/accountReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/account/1?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/accountUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "AR3-Updated111",
    "SubAccount": false,
    "FullyQualifiedName": "AR3-Updated",
    "Active": true,
    "Classification": "Asset",
    "AccountType": "Accounts Receivable",
    "AccountSubType": "AccountsReceivable",
    "CurrentBalance": 0,
    "CurrentBalanceWithSubAccounts": 0,
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "domain": "QBO",
    "sparse": false,
    "Id": "94",
    "SyncToken": "3"
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/account?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/accountReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from Account STARTPOSITION 1 MAXRESULTS 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Attachable ------------------------------ )
app.post('/attachableCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "AttachableRef": [
      {
        "EntityRef": {
          "value": "130",
          "type": "Invoice"
        },
        "IncludeOnSend": "false"
      }
    ],
    "Note": "This is an attached note."
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/attachable?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/attachableReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/attachable/5000000000000029383?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/attachableUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Note": "This is an attached note. Updated",
    "domain": "QBO",
    "sparse": false,
    "Id": "5000000000000029383",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-18T00:18:04-07:00",
      "LastUpdatedTime": "2016-08-18T00:18:04-07:00"
    },
    "AttachableRef": [
      {
        "EntityRef": {
          "value": "130",
          "type": "Invoice"
        },
        "IncludeOnSend": false
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/attachable?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/attachableDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Note": "This is an attached note. Updated1",
    "domain": "QBO",
    "sparse": false,
    "Id": "5000000000000029383",
    "SyncToken": "2",
    "MetaData": {
      "CreateTime": "2016-08-18T00:18:04-07:00",
      "LastUpdatedTime": "2016-08-18T00:18:04-07:00"
    },
    "AttachableRef": [
      {
        "EntityRef": {
          "value": "130",
          "type": "Invoice"
        },
        "IncludeOnSend": false
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/attachable?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/attachableReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from Attachable"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/uploadAttachments', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = ` --37a1965f87babd849241a530ad71e169
Content-Disposition: form-data; name="file_metadata_0"
Content-Type: application/json; charset=UTF-8
Content-Transfer-Encoding: 8bit

{
    "AttachableRef": [
    {
      "EntityRef": {
        "type": "Invoice",
        "value": "173"
      }
    }
  ],
   "FileName": "receipt_nov15.jpg",
    "ContentType": "image/jpg"
  }
--37a1965f87babd849241a530ad71e169
Content-Disposition: form-data; name="file_content_0"; filename="398535758.jpg"
Content-Type: image/jpeg
Content-Transfer-Encoding: base64

/9j/4AAQSkZJRgABAQEAlgCWAAD/4ge4SUNDX1BST0ZJTEUAAQEAAAeoYXBwbAIgAABtbnRyUkdC
IFhZWiAH2QACABkACwAaAAthY3NwQVBQTAAAAABhcHBsAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAA
AADTLWFwcGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtk
ZXNjAAABCAAAAG9kc2NtAAABeAAABWxjcHJ0AAAG5AAAADh3dHB0AAAHHAAAABRyWFlaAAAHMAAA
ABRnWFlaAAAHRAAAABRiWFlaAAAHWAAAABRyVFJDAAAHbAAAAA5jaGFkAAAHfAAAACxiVFJDAAAH
bAAAAA5nVFJDAAAHbAAAAA5kZXNjAAAAAAAAABRHZW5lcmljIFJHQiBQcm9maWxlAAAAAAAAAAAA
AAAUR2VuZXJpYyBSR0IgUHJvZmlsZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAbWx1YwAAAAAAAAAeAAAADHNrU0sAAAAoAAABeGhySFIAAAAoAAABoGNh
RVMAAAAkAAAByHB0QlIAAAAmAAAB7HVrVUEAAAAqAAACEmZyRlUAAAAoAAACPHpoVFcAAAAWAAAC
ZGl0SVQAAAAoAAACem5iTk8AAAAmAAAComtvS1IAAAAWAAACyGNzQ1oAAAAiAAAC3mhlSUwAAAAe
AAADAGRlREUAAAAsAAADHmh1SFUAAAAoAAADSnN2U0UAAAAmAAAConpoQ04AAAAWAAADcmphSlAA
AAAaAAADiHJvUk8AAAAkAAADomVsR1IAAAAiAAADxnB0UE8AAAAmAAAD6G5sTkwAAAAoAAAEDmVz
RVMAAAAmAAAD6HRoVEgAAAAkAAAENnRyVFIAAAAiAAAEWmZpRkkAAAAoAAAEfHBsUEwAAAAsAAAE
pHJ1UlUAAAAiAAAE0GFyRUcAAAAmAAAE8mVuVVMAAAAmAAAFGGRhREsAAAAuAAAFPgBWAWEAZQBv
AGIAZQBjAG4A/QAgAFIARwBCACAAcAByAG8AZgBpAGwARwBlAG4AZQByAGkBDQBrAGkAIABSAEcA
QgAgAHAAcgBvAGYAaQBsAFAAZQByAGYAaQBsACAAUgBHAEIAIABnAGUAbgDoAHIAaQBjAFAAZQBy
AGYAaQBsACAAUgBHAEIAIABHAGUAbgDpAHIAaQBjAG8EFwQwBDMEMAQ7BEwEPQQ4BDkAIAQ/BEAE
PgREBDAEOQQ7ACAAUgBHAEIAUAByAG8AZgBpAGwAIABnAOkAbgDpAHIAaQBxAHUAZQAgAFIAVgBC
kBp1KAAgAFIARwBCACCCcl9pY8+P8ABQAHIAbwBmAGkAbABvACAAUgBHAEIAIABnAGUAbgBlAHIA
aQBjAG8ARwBlAG4AZQByAGkAcwBrACAAUgBHAEIALQBwAHIAbwBmAGkAbMd8vBgAIABSAEcAQgAg
1QS4XNMMx3wATwBiAGUAYwBuAP0AIABSAEcAQgAgAHAAcgBvAGYAaQBsBeQF6AXVBeQF2QXcACAA
UgBHAEIAIAXbBdwF3AXZAEEAbABsAGcAZQBtAGUAaQBuAGUAcwAgAFIARwBCAC0AUAByAG8AZgBp
AGwAwQBsAHQAYQBsAOEAbgBvAHMAIABSAEcAQgAgAHAAcgBvAGYAaQBsZm6QGgAgAFIARwBCACBj
z4/wZYdO9k4AgiwAIABSAEcAQgAgMNcw7TDVMKEwpDDrAFAAcgBvAGYAaQBsACAAUgBHAEIAIABn
AGUAbgBlAHIAaQBjA5MDtQO9A7kDugPMACADwAPBA78DxgOvA7sAIABSAEcAQgBQAGUAcgBmAGkA
bAAgAFIARwBCACAAZwBlAG4A6QByAGkAYwBvAEEAbABnAGUAbQBlAGUAbgAgAFIARwBCAC0AcABy
AG8AZgBpAGUAbA5CDhsOIw5EDh8OJQ5MACAAUgBHAEIAIA4XDjEOSA4nDkQOGwBHAGUAbgBlAGwA
IABSAEcAQgAgAFAAcgBvAGYAaQBsAGkAWQBsAGUAaQBuAGUAbgAgAFIARwBCAC0AcAByAG8AZgBp
AGkAbABpAFUAbgBpAHcAZQByAHMAYQBsAG4AeQAgAHAAcgBvAGYAaQBsACAAUgBHAEIEHgQxBEkE
OAQ5ACAEPwRABD4ERAQ4BDsETAAgAFIARwBCBkUGRAZBACAGKgY5BjEGSgZBACAAUgBHAEIAIAYn
BkQGOQYnBkUARwBlAG4AZQByAGkAYwAgAFIARwBCACAAUAByAG8AZgBpAGwAZQBHAGUAbgBlAHIA
ZQBsACAAUgBHAEIALQBiAGUAcwBrAHIAaQB2AGUAbABzAGV0ZXh0AAAAAENvcHlyaWdodCAyMDA3
IEFwcGxlIEluYy4sIGFsbCByaWdodHMgcmVzZXJ2ZWQuAFhZWiAAAAAAAADzUgABAAAAARbPWFla
IAAAAAAAAHRNAAA97gAAA9BYWVogAAAAAAAAWnUAAKxzAAAXNFhZWiAAAAAAAAAoGgAAFZ8AALg2
Y3VydgAAAAAAAAABAc0AAHNmMzIAAAAAAAEMQgAABd7///MmAAAHkgAA/ZH///ui///9owAAA9wA
AMBs/+EAgEV4aWYAAE1NACoAAAAIAAUBEgADAAAAAQABAAABGgAFAAAAAQAAAEoBGwAFAAAAAQAA
AFIBKAADAAAAAQACAACHaQAEAAAAAQAAAFoAAAAAAAA6mQAAAGQAADqZAAAAZAACoAIABAAAAAEA
AAAuoAMABAAAAAEAAAAUAAAAAP/bAEMAAgEBAgEBAgIBAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYG
BgcICwkHCAoIBgYJDQkKCwsMDAwHCQ0ODQwOCwwMC//bAEMBAgICAwIDBQMDBQsIBggLCwsLCwsL
CwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLC//AABEIABQALgMBIgAC
EQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAA
AX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4
OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaan
qKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQAD
AQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEG
EkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpT
VFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4
ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APkb41eO
NYtfi94oSDVdRVF1a74FzJgfvn96j+Kmj+O/gj/wj3/C159Q0MeK9Et/EekmfU1IvdPuN/kzrtkO
0N5b/K2GGOQKzvjnz8YPFX/YVvP/AEc9fePiv9qXwn4K+Eut674A8S+Br3xl4e/Zd8MaZ4dF0LPU
HtvENte3TtbwwThla8h3RuYipI+UspFfueIryw6p8kOa+n5Ja62310Z+V4XDRxU5RlPl8z4O0S/8
YeJfB+t+IfD1xrN7oPhpbZtV1GG7ZrXTxczeRb+bJvwDLLlEAyWYHA4OK/hTxP4i8ceKdI0Xwrq9
1eanr13FY6fANS2fappZFjRVdnCgF2UFiQozkkDmv0r+KX7VPhO/8JftJaX8I/HPwu0qXxf4c8C+
JZIA1hDb63cpldfjtwI2WS7NvFGnkINyyMpXY7Fqq/GDUvhB4d+IXxP17TPHvwc1nTfiB8a/h/4o
0O10zVbW4lstChubNbxpoto+zxARztLHyAgZnADc8NPN5ydpUbXtbfqob6dOZ9vha8zu/smElpXX
W+3eW2vku+5+fXjvw38RPhlZm58eRa7ptp/a97oCXT3m+3nv7Jtt3BDKkhWUwtwzISgPG4mux/ZD
8Y6tefEO++06nqL7dOkxm6k4/exf7VfRX/BRD9oTTfiz+xBaaD8NPGfgK803wz8XvFf2nRLOWzjv
30+XU5pNKntIUQSPbeU+8yxkKUK7i+AB8x/sc/8AJQ7/AP7Bz/8Ao2KuqlWnicLOdSKTu1b0em/d
anFVpRw+IjCnK60d/X0O/wDil+zfoWofE7xJNcXOqb31W7JxJHj/AF7/APTOsH/hmPw//wA/Gqf9
/I//AI3RRXRTk+VamM4rmegv/DMfh/H/AB8ap/38j/8AjdB/Zj8Pn/l41Trn/WR9f+/dFFVzPuRZ
XEP7Mfh89bjVOP8AppFx/wCQ69I/Zf8A2d9F0z4hXP2S61Qb9Olzl4z0lh/6Z+9FFY4mT9lLU1oJ
c6P/2Q==

--37a1965f87babd849241a530ad71e169--`
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/upload`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Batch ------------------------------ )
app.post('/batch', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "BatchItemRequest":
      [
        {
          "bId": "bid1",
          "operation": "create",
          "Vendor": {
            "DisplayName": "Smith Family Store"
          }
        }, {
          "bId": "bid2",
          "operation": "delete",
          "Invoice": {
            "Id": "129",
            "SyncToken": "0"
          }
        }, {
          "bId": "bid3",
          "operation": "update",
          "SalesReceipt": {
            "domain": "QBO",
            "sparse": true,
            "Id": "11",
            "SyncToken": "0",
            "PrivateNote": "A private note."
          }
        }, {
          "bId": "bid4",
          "Query": "select * from SalesReceipt"
        }
      ]
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/batch?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Bill ------------------------------ )
app.post('/billCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [
      {
        "Id": "1",
        "Amount": 200.00,
        "DetailType": "AccountBasedExpenseLineDetail",
        "AccountBasedExpenseLineDetail":
        {
          "AccountRef":
          {
            "value": "7"
          }
        }
      }
    ],
    "VendorRef":
    {
      "value": "56"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/bill?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/billGetById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/bill/1?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/billUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [
      {
        "Id": "1",
        "Amount": 240.67,
        "DetailType": "AccountBasedExpenseLineDetail",
        "AccountBasedExpenseLineDetail":
        {
          "AccountRef":
          {
            "value": "7"
          }
        }
      }
    ],
    "VendorRef":
    {
      "value": "56"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/bill?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/billDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "149",
    "SyncToken": "0"
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/bill?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/billGetAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from Bill startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ BillPayment ------------------------------ )
app.post('/billPaymentCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "VendorRef": {
      "value": "62",
      "name": "Test"
    },
    "PayType": "Check",
    "CheckPayment": {
      "BankAccountRef": {
        "value": "35",
        "name": "Checking"
      }
    },
    "TotalAmt": 100.00,
    "PrivateNote": "Acct. 1JK90",
    "Line": [
      {
        "Amount": 100.00,
        "LinkedTxn": [
          {
            "TxnId": "153",
            "TxnType": "Bill"
          }
        ]
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/billpayment?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/billPaymentReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/billpayment/118?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/billPaymentDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "154",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/billpayment?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/billPaymentReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from BillPayment startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/billPaymentUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "VendorRef": {
      "value": "62",
      "name": "Test"
    },
    "PayType": "Check",
    "CheckPayment": {
      "BankAccountRef": {
        "value": "35",
        "name": "Checking"
      }
    },
    "TotalAmt": 100.00,
    "PrivateNote": "Updated Note",
    "Line": [
      {
        "Amount": 100.00,
        "LinkedTxn": [
          {
            "TxnId": "153",
            "TxnType": "Bill"
          }
        ]
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/billpayment?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Budget ------------------------------ )
app.post('/budgetReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from Budget startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ ChangeDataCapture ------------------------------ )
app.get('/cDCRead', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/cdc?entities=bill,invoice&changedSince=YYYY-MM-DD`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Class ------------------------------ )
app.post('/classCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "France"
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/class?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/classReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/class/5000000000000018727?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/classUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "France-I",
    "SubClass": false,
    "FullyQualifiedName": "France",
    "Active": true,
    "domain": "QBO",
    "sparse": false,
    "Id": "5000000000000018727",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/class?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/classDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "5000000000000018727",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/class?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/classReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from Class startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ CompanyInfo ------------------------------ )
app.get('/companyInfoReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/companyinfo/${companyid}?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/companyInfoRead', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from CompanyInfo"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ CreditMemo ------------------------------ )
app.post('/creditMemoCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [
      {
        "Amount": 50,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail":
        {
          "ItemRef":
          {
            "value": "3",
            "name": "Concrete"
          }
        }
      }],
    "CustomerRef":
    {
      "value": "3",
      "name": "CoolCars"
    }
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/creditmemo?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/creditMemoReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/creditmemo/160?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/creditMemoUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "RemainingCredit": 50,
    "domain": "QBO",
    "sparse": false,
    "Id": "160",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-18T13:09:52-07:00",
      "LastUpdatedTime": "2016-08-18T13:09:52-07:00"
    },
    "CustomField": [
      {
        "DefinitionId": "1",
        "Name": "Crew #",
        "Type": "StringType"
      }
    ],
    "DocNumber": "1040-Updated",
    "TxnDate": "2016-08-18",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "1",
        "LineNum": 1,
        "Amount": 50,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "3",
            "name": "Concrete"
          },
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      },
      {
        "Amount": 50,
        "DetailType": "SubTotalLineDetail",
        "SubTotalLineDetail": {}
      }
    ],
    "TxnTaxDetail": {
      "TotalTax": 0
    },
    "CustomerRef": {
      "value": "3",
      "name": "Cool Cars"
    },
    "BillAddr": {
      "Id": "4",
      "Line1": "65 Ocean Dr.",
      "City": "Half Moon Bay",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94213",
      "Lat": "37.4300318",
      "Long": "-122.4336537"
    },
    "ShipAddr": {
      "Id": "4",
      "Line1": "65 Ocean Dr.",
      "City": "Half Moon Bay",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94213",
      "Lat": "37.4300318",
      "Long": "-122.4336537"
    },
    "TotalAmt": 50,
    "HomeTotalAmt": 50,
    "ApplyTaxAfterDiscount": false,
    "PrintStatus": "NeedToPrint",
    "EmailStatus": "NotSet",
    "Balance": 50
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/creditmemo?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/creditMemoReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from CreditMemo startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/creditMemoDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "160",
    "SyncToken": "2"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/creditmemo?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Customer ------------------------------ )
app.post('/customerCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "BillAddr": {
      "Line1": "123 Main Street",
      "City": "Mountain View",
      "Country": "USA",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94042"
    },
    "Notes": "Here are other details.",
    "DisplayName": "King's Groceries1",
    "PrimaryPhone": {
      "FreeFormNumber": "(555) 555-5555"
    },
    "PrimaryEmailAddr": {
      "Address": "jdrew@myemail.com"
    }
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/customer?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/customerReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/customer/63?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/customerUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Taxable": true,
    "BillAddr": {
      "Id": "100",
      "Line1": "123 Main Street",
      "City": "Mountain View",
      "Country": "USA",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94042"
    },
    "Notes": "Here are other details.",
    "Job": false,
    "BillWithParent": false,
    "Balance": 0,
    "BalanceWithJobs": 0,
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "PreferredDeliveryMethod": "Print",
    "domain": "QBO",
    "sparse": false,
    "Id": "63",
    "SyncToken": "2",
    "FullyQualifiedName": "King's Groceries-Updated",
    "DisplayName": "King's Groceries-Updated",
    "PrintOnCheckName": "King's Groceries1",
    "Active": true,
    "PrimaryPhone": {
      "FreeFormNumber": "(555) 555-5555"
    },
    "PrimaryEmailAddr": {
      "Address": "jdrew@myemail.com"
    },
    "DefaultTaxCodeRef": {
      "value": "2"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/customer?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/customerDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "domain": "QBO",
    "sparse": true,
    "Id": "67",
    "SyncToken": "0",
    "Active": false
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/customer`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/customerReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from Customer startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Department ------------------------------ )
app.post('/departmentCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Marketing Department"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/department?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/departmentUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Marketing Department-Updated",
    "SubDepartment": false,
    "FullyQualifiedName": "Marketing Department",
    "Active": true,
    "domain": "QBO",
    "sparse": false,
    "Id": "1",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/department?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/departmentReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/department/1?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/departmentDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Marketing Department-Updated",
    "SubDepartment": false,
    "FullyQualifiedName": "Marketing Department",
    "Active": false,
    "domain": "QBO",
    "sparse": false,
    "Id": "1",
    "SyncToken": "2"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/department`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/departmentReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "Select * from Department startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Deposit ------------------------------ )
app.post('/depositCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "DepositToAccountRef":
    {
      "value": "35",
      "name": "Checking"
    },
    "Line": [
      {
        "Amount": 20.00,
        "DetailType": "DepositLineDetail",
        "DepositLineDetail":
        {
          "AccountRef":
          {
            "value": "87",
            "name": "Unapplied Cash Payment Income"
          }
        }
      }]
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/deposit?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/depositReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/deposit/162?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/depositUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "DepositToAccountRef": {
      "value": "35",
      "name": "Checking"
    },
    "TotalAmt": 205,
    "domain": "QBO",
    "sparse": false,
    "Id": "162",
    "SyncToken": "0",
    "TxnDate": "2016-08-18",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "1",
        "LineNum": 1,
        "Amount": 205,
        "DetailType": "DepositLineDetail",
        "DepositLineDetail": {
          "AccountRef": {
            "value": "87",
            "name": "Unapplied Cash Payment Income"
          }
        }
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/deposit?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/depositDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "162",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/deposit?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/depositReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from Deposit startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Employee ------------------------------ )
app.post('/employeeCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "SSN": "444-55-6666",
    "PrimaryAddr": {
      "Id": "50",
      "Line1": "45 N. Elm Street",
      "City": "Middlefield",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "93242"
    },
    "GivenName": "John",
    "FamilyName": "Meuller",
    "PrimaryPhone": {
      "FreeFormNumber": "408-525-1234"
    }
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/employee?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/employeeReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/employee/68?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/employeeUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "SSN": "XXX-XX-XXXX",
    "PrimaryAddr": {
      "Id": "105",
      "Line1": "45 N. Elm Street",
      "City": "Middlefield",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "93242"
    },
    "BillableTime": false,
    "domain": "QBO",
    "sparse": false,
    "Id": "68",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-18T16:04:16-07:00",
      "LastUpdatedTime": "2016-08-18T16:04:16-07:00"
    },
    "GivenName": "John",
    "FamilyName": "Meuller",
    "DisplayName": "John Meuller - Updated",
    "PrintOnCheckName": "John Meuller",
    "Active": true,
    "PrimaryPhone": {
      "FreeFormNumber": "408-525-1234"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/employee?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/employeeDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "SSN": "XXX-XX-XXXX",
    "PrimaryAddr": {
      "Id": "105",
      "Line1": "45 N. Elm Street",
      "City": "Middlefield",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "93242"
    },
    "BillableTime": false,
    "domain": "QBO",
    "sparse": false,
    "Id": "68",
    "SyncToken": "2",
    "MetaData": {
      "CreateTime": "2016-08-18T16:04:16-07:00",
      "LastUpdatedTime": "2016-08-18T16:04:16-07:00"
    },
    "GivenName": "John",
    "FamilyName": "Meuller",
    "DisplayName": "John Meuller - Updated",
    "PrintOnCheckName": "John Meuller",
    "Active": false,
    "PrimaryPhone": {
      "FreeFormNumber": "408-525-1234"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/employee`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/employeeReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from employee startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Estimate ------------------------------ )
app.post('/estimateCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [
      {
        "Id": "1",
        "LineNum": 1,
        "Description": "Pest Control Services",
        "Amount": 35.0,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "10",
            "name": "Pest Control"
          },
          "UnitPrice": 35,
          "Qty": 1,
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      },
      {
        "Amount": 35.0,
        "DetailType": "SubTotalLineDetail",
        "SubTotalLineDetail": {}
      },
      {
        "Amount": 3.5,
        "DetailType": "DiscountLineDetail",
        "DiscountLineDetail": {
          "PercentBased": true,
          "DiscountPercent": 10,
          "DiscountAccountRef": {
            "value": "86",
            "name": "Discounts given"
          }
        }
      }
    ],
    "TxnTaxDetail": {
      "TotalTax": 0
    },
    "CustomerRef": {
      "value": "3",
      "name": "Cool Cars"
    },
    "CustomerMemo": {
      "value": "Thank you for your business and have a great day!"
    },
    "TotalAmt": 31.5,
    "ApplyTaxAfterDiscount": false,
    "PrintStatus": "NeedToPrint",
    "EmailStatus": "NotSet",
    "BillEmail": {
      "Address": "Cool_Cars@intuit.com"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/estimate?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/estimateUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "domain": "QBO",
    "sparse": false,
    "Id": "163",
    "SyncToken": "0",
    "CustomField": [
      {
        "DefinitionId": "1",
        "Name": "Crew #",
        "Type": "StringType"
      }
    ],
    "DocNumber": "1001-Updated",
    "TxnDate": "2016-08-18",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "TxnStatus": "Pending",
    "Line": [
      {
        "Id": "1",
        "LineNum": 1,
        "Description": "Pest Control Services",
        "Amount": 35,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "10",
            "name": "Pest Control"
          },
          "UnitPrice": 35,
          "Qty": 1,
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      },
      {
        "Amount": 35,
        "DetailType": "SubTotalLineDetail",
        "SubTotalLineDetail": {}
      },
      {
        "Amount": 3.5,
        "DetailType": "DiscountLineDetail",
        "DiscountLineDetail": {
          "PercentBased": true,
          "DiscountPercent": 10,
          "DiscountAccountRef": {
            "value": "86",
            "name": "Discounts given"
          }
        }
      }
    ],
    "TxnTaxDetail": {
      "TotalTax": 0
    },
    "CustomerRef": {
      "value": "3",
      "name": "Cool Cars"
    },
    "CustomerMemo": {
      "value": "Thank you for your business and have a great day!"
    },
    "BillAddr": {
      "Id": "4",
      "Line1": "65 Ocean Dr.",
      "City": "Half Moon Bay",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94213",
      "Lat": "37.4300318",
      "Long": "-122.4336537"
    },
    "ShipAddr": {
      "Id": "4",
      "Line1": "65 Ocean Dr.",
      "City": "Half Moon Bay",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94213",
      "Lat": "37.4300318",
      "Long": "-122.4336537"
    },
    "TotalAmt": 31.5,
    "HomeTotalAmt": 31.5,
    "ApplyTaxAfterDiscount": false,
    "PrintStatus": "NeedToPrint",
    "EmailStatus": "NotSet",
    "BillEmail": {
      "Address": "Cool_Cars@intuit.com"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/estimate?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/estimateReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/estimate/163?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/estimateDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "163",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/estimate?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/estimateReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from estimate startposition 1 maxresults 10"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ ExchangeRate ------------------------------ )
app.get('/exchangeRateGetDetails', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/exchangerate?sourcecurrencycode=USD&asofdate=2017-04-25&minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/exchangeRateQuery', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from exchangerate where sourcecurrencycode in ('USD', 'INR') and asofdate='2016-07-07'"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?query=select * from exchangerate where sourcecurrencycode in ('EUR', 'INR') and asofdate='2017-07-07'&minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Invoice ------------------------------ )
app.post('/invoiceCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [
      {
        "Amount": 100.00,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "1",
            "name": "Services"
          }
        }
      }
    ],
    "CustomerRef": {
      "value": "1"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/invoice?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/invoiceReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/invoice/147?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/invoiceUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Deposit": 0,
    "AllowIPNPayment": false,
    "AllowOnlinePayment": false,
    "AllowOnlineCreditCardPayment": false,
    "AllowOnlineACHPayment": false,
    "domain": "QBO",
    "sparse": false,
    "Id": "164",
    "SyncToken": "0",
    "CustomField": [
      {
        "DefinitionId": "1",
        "Name": "Crew #",
        "Type": "StringType"
      }
    ],
    "DocNumber": "1041-Updated",
    "TxnDate": "2016-08-18",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "LinkedTxn": [],
    "Line": [
      {
        "Id": "1",
        "LineNum": 1,
        "Amount": 100,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "1",
            "name": "Services"
          },
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      },
      {
        "Amount": 100,
        "DetailType": "SubTotalLineDetail",
        "SubTotalLineDetail": {}
      }
    ],
    "TxnTaxDetail": {
      "TotalTax": 0
    },
    "CustomerRef": {
      "value": "1",
      "name": "Amy's Bird Sanctuary"
    },
    "BillAddr": {
      "Id": "2",
      "Line1": "4581 Finch St.",
      "City": "Bayshore",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94326",
      "Lat": "INVALID",
      "Long": "INVALID"
    },
    "ShipAddr": {
      "Id": "2",
      "Line1": "4581 Finch St.",
      "City": "Bayshore",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94326",
      "Lat": "INVALID",
      "Long": "INVALID"
    },
    "DueDate": "2016-09-17",
    "TotalAmt": 100,
    "HomeTotalAmt": 100,
    "ApplyTaxAfterDiscount": false,
    "PrintStatus": "NeedToPrint",
    "EmailStatus": "NotSet",
    "Balance": 100
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/invoice?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/invoiceDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "130",
    "SyncToken": "10"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/invoice?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/invoiceReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from invoice startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/invoiceVoid', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "173",
    "SyncToken": "2"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/invoice?operation=void`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Item ------------------------------ )
app.post('/itemCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Garden Supplies1",
    "IncomeAccountRef": {
      "value": "79",
      "name": "Sales of Product Income"
    },
    "ExpenseAccountRef": {
      "value": "80",
      "name": "Cost of Goods Sold"
    },
    "AssetAccountRef": {
      "value": "81",
      "name": "Inventory Asset"
    },
    "Type": "Inventory",
    "TrackQtyOnHand": true,
    "QtyOnHand": 10,
    "InvStartDate": "2015-01-01"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/item?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/itemReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/item/<ID>?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/itemUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Garden Supplies-Updated",
    "Active": true,
    "FullyQualifiedName": "Garden Supplies-Updated",
    "Taxable": false,
    "UnitPrice": 0,
    "Type": "Inventory",
    "IncomeAccountRef": {
      "value": "79",
      "name": "Sales of Product Income"
    },
    "PurchaseCost": 0,
    "ExpenseAccountRef": {
      "value": "80",
      "name": "Cost of Goods Sold"
    },
    "AssetAccountRef": {
      "value": "81",
      "name": "Inventory Asset"
    },
    "TrackQtyOnHand": true,
    "QtyOnHand": 10,
    "InvStartDate": "2015-01-01",
    "domain": "QBO",
    "sparse": false,
    "Id": "20",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/item?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/itemDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Garden Supplies-Updated",
    "Active": false,
    "FullyQualifiedName": "Garden Supplies-Updated",
    "Taxable": false,
    "UnitPrice": 0,
    "Type": "Inventory",
    "IncomeAccountRef": {
      "value": "79",
      "name": "Sales of Product Income"
    },
    "PurchaseCost": 0,
    "ExpenseAccountRef": {
      "value": "80",
      "name": "Cost of Goods Sold"
    },
    "AssetAccountRef": {
      "value": "81",
      "name": "Inventory Asset"
    },
    "TrackQtyOnHand": true,
    "QtyOnHand": 10,
    "InvStartDate": "2015-01-01",
    "domain": "QBO",
    "sparse": false,
    "Id": "20",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/item?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/itemReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from item startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ JournalEntry ------------------------------ )
app.post('/journalEntryCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [
      {
        "Id": "0",
        "Description": "nov portion of rider insurance",
        "Amount": 100.0,
        "DetailType": "JournalEntryLineDetail",
        "JournalEntryLineDetail": {
          "PostingType": "Debit",
          "AccountRef": {
            "value": "39",
            "name": "Opening Bal Equity"
          }
        }
      },
      {
        "Description": "nov portion of rider insurance",
        "Amount": 100.0,
        "DetailType": "JournalEntryLineDetail",
        "JournalEntryLineDetail": {
          "PostingType": "Credit",
          "AccountRef": {
            "value": "44",
            "name": "Notes Payable"
          }

        }
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/journalentry?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/journalEntryReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/journalentry/8?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/journalEntryUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Adjustment": false,
    "domain": "QBO",
    "sparse": false,
    "Id": "167",
    "SyncToken": "0",
    "TxnDate": "2016-08-19",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "0",
        "Description": "nov portion of rider insurance-updated",
        "Amount": 100,
        "DetailType": "JournalEntryLineDetail",
        "JournalEntryLineDetail": {
          "PostingType": "Debit",
          "AccountRef": {
            "value": "39",
            "name": "Truck:Depreciation"
          }
        }
      },
      {
        "Id": "1",
        "Description": "nov portion of rider insurance-updated",
        "Amount": 100,
        "DetailType": "JournalEntryLineDetail",
        "JournalEntryLineDetail": {
          "PostingType": "Credit",
          "AccountRef": {
            "value": "44",
            "name": "Notes Payable"
          }
        }
      }
    ],
    "TxnTaxDetail": {}
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/journalentry?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/journalEntryDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "167",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/journalentry?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/journalEntryReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from journalentry startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Payment ------------------------------ )
app.post('/paymentCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "CustomerRef":
    {
      "value": "58",
      "name": "TEST123"
    },
    "TotalAmt": 100.00,
    "Line": [
      {
        "Amount": 100.00,
        "LinkedTxn": [
          {
            "TxnId": "173",
            "TxnType": "Invoice"
          }]
      }]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/payment?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/paymentReadByID', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/payment/174?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/paymentReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from payment startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/paymentUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "CustomerRef": {
      "value": "58",
      "name": "TEST123"
    },
    "DepositToAccountRef": {
      "value": "4"
    },
    "TotalAmt": 100,
    "UnappliedAmt": 0,
    "ProcessPayment": false,
    "domain": "QBO",
    "sparse": false,
    "Id": "174",
    "SyncToken": "0",
    "TxnDate": "2016-08-29",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Amount": 100,
        "LinkedTxn": [
          {
            "TxnId": "173",
            "TxnType": "Invoice"
          }
        ],
        "LineEx": {
          "any": [
            {
              "name": "{http://schema.intuit.com/finance/v3}NameValue",
              "declaredType": "com.intuit.schema.finance.v3.NameValue",
              "scope": "javax.xml.bind.JAXBElement$GlobalScope",
              "value": {
                "Name": "txnId",
                "Value": "173"
              },
              "nil": false,
              "globalScope": true,
              "typeSubstituted": false
            },
            {
              "name": "{http://schema.intuit.com/finance/v3}NameValue",
              "declaredType": "com.intuit.schema.finance.v3.NameValue",
              "scope": "javax.xml.bind.JAXBElement$GlobalScope",
              "value": {
                "Name": "txnOpenBalance",
                "Value": "100.00"
              },
              "nil": false,
              "globalScope": true,
              "typeSubstituted": false
            },
            {
              "name": "{http://schema.intuit.com/finance/v3}NameValue",
              "declaredType": "com.intuit.schema.finance.v3.NameValue",
              "scope": "javax.xml.bind.JAXBElement$GlobalScope",
              "value": {
                "Name": "txnReferenceNumber",
                "Value": "1043"
              },
              "nil": false,
              "globalScope": true,
              "typeSubstituted": false
            }
          ]
        }
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/payment?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/paymentDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "174",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/payment?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ PaymentMethod ------------------------------ )
app.post('/paymentMethodCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Business Check"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/paymentmethod?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/paymentMethodReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/paymentmethod/8?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/paymentMethodUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Business Check-Updated",
    "Active": true,
    "Type": "NON_CREDIT_CARD",
    "domain": "QBO",
    "sparse": false,
    "Id": "8",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-23T20:09:50-07:00",
      "LastUpdatedTime": "2016-08-23T20:09:50-07:00"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/paymentmethod?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/paymentMethodDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Business Check-Updated",
    "Active": false,
    "Type": "NON_CREDIT_CARD",
    "domain": "QBO",
    "sparse": false,
    "Id": "8",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-23T20:09:50-07:00",
      "LastUpdatedTime": "2016-08-23T20:09:50-07:00"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/paymentmethod`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/paymentMethodReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from paymentmethod startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Preferences ------------------------------ )
app.post('/preferenceReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from preferences "
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/preferenceRead', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/preferences?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/preferenceUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "AccountingInfoPrefs": {
      "TrackDepartments": true,
      "DepartmentTerminology": "Location",
      "ClassTrackingPerTxn": false,
      "ClassTrackingPerTxnLine": true,
      "CustomerTerminology": "Customers"
    },
    "ProductAndServicesPrefs": {
      "ForSales": true,
      "ForPurchase": true,
      "QuantityWithPriceAndRate": true,
      "QuantityOnHand": true
    },
    "SalesFormsPrefs": {
      "CustomField": [
        {
          "CustomField": [
            {
              "Name": "SalesFormsPrefs.UseSalesCustom3",
              "Type": "BooleanType",
              "BooleanValue": false
            },
            {
              "Name": "SalesFormsPrefs.UseSalesCustom2",
              "Type": "BooleanType",
              "BooleanValue": false
            },
            {
              "Name": "SalesFormsPrefs.UseSalesCustom1",
              "Type": "BooleanType",
              "BooleanValue": true
            }
          ]
        },
        {
          "CustomField": [
            {
              "Name": "SalesFormsPrefs.SalesCustomName1",
              "Type": "StringType",
              "StringValue": "Crew #"
            }
          ]
        }
      ],
      "CustomTxnNumbers": false,
      "AllowDeposit": true,
      "AllowDiscount": true,
      "DefaultDiscountAccount": "86",
      "AllowEstimates": true,
      "ETransactionEnabledStatus": "NotApplicable",
      "ETransactionAttachPDF": false,
      "ETransactionPaymentEnabled": false,
      "IPNSupportEnabled": false,
      "AllowServiceDate": false,
      "AllowShipping": false,
      "DefaultTerms": {
        "value": "3"
      },
      "DefaultCustomerMessage": "Thank you for your business and have a great day!"
    },
    "EmailMessagesPrefs": {
      "InvoiceMessage": {
        "Subject": "Invoice from Craig's Design and Landscaping Services",
        "Message": "Your invoice is attached.  Please remit payment at your earliest convenience.\nThank you for your business - we appreciate it very much.\n\nSincerely,\nCraig's Design and Landscaping Services"
      },
      "EstimateMessage": {
        "Subject": "Estimate from Craig's Design and Landscaping Services",
        "Message": "Please review the estimate below.  Feel free to contact us if you have any questions.\nWe look forward to working with you.\n\nSincerely,\nCraig's Design and Landscaping Services"
      },
      "SalesReceiptMessage": {
        "Subject": "Sales Receipt from Craig's Design and Landscaping Services",
        "Message": "Your sales receipt is attached.\nThank you for your business - we appreciate it very much.\n\nSincerely,\nCraig's Design and Landscaping Services"
      },
      "StatementMessage": {
        "Subject": "Statement from Craig's Design and Landscaping Services",
        "Message": "Your statement is attached.  Please remit payment at your earliest convenience.\nThank you for your business - we appreciate it very much.\n\nSincerely,\nCraig's Design and Landscaping Services"
      }
    },
    "VendorAndPurchasesPrefs": {
      "TrackingByCustomer": true,
      "BillableExpenseTracking": true,
      "POCustomField": [
        {
          "CustomField": [
            {
              "Name": "PurchasePrefs.UsePurchaseCustom3",
              "Type": "BooleanType",
              "BooleanValue": false
            },
            {
              "Name": "PurchasePrefs.UsePurchaseCustom2",
              "Type": "BooleanType",
              "BooleanValue": true
            },
            {
              "Name": "PurchasePrefs.UsePurchaseCustom1",
              "Type": "BooleanType",
              "BooleanValue": true
            }
          ]
        },
        {
          "CustomField": [
            {
              "Name": "PurchasePrefs.PurchaseCustomName2",
              "Type": "StringType",
              "StringValue": "Sales Rep"
            },
            {
              "Name": "PurchasePrefs.PurchaseCustomName1",
              "Type": "StringType",
              "StringValue": "Crew #"
            }
          ]
        }
      ]
    },
    "TimeTrackingPrefs": {
      "UseServices": true,
      "BillCustomers": true,
      "ShowBillRateToAll": false,
      "WorkWeekStartDate": "Monday",
      "MarkTimeEntriesBillable": true
    },
    "TaxPrefs": {
      "UsingSalesTax": true,
      "TaxGroupCodeRef": {
        "value": "2"
      }
    },
    "CurrencyPrefs": {
      "MultiCurrencyEnabled": true,
      "HomeCurrency": {
        "value": "USD"
      }
    },
    "ReportPrefs": {
      "ReportBasis": "Accrual",
      "CalcAgingReportFromTxnDate": false
    },
    "OtherPrefs": {
      "NameValue": [
        {
          "Name": "SalesFormsPrefs.DefaultCustomerMessage",
          "Value": "Thank you for your business and have a great day!"
        },
        {
          "Name": "SalesFormsPrefs.DefaultItem",
          "Value": "1"
        },
        {
          "Name": "DTXCopyMemo",
          "Value": "false"
        },
        {
          "Name": "UncategorizedAssetAccountId",
          "Value": "32"
        },
        {
          "Name": "UncategorizedIncomeAccountId",
          "Value": "30"
        },
        {
          "Name": "UncategorizedExpenseAccountId",
          "Value": "31"
        },
        {
          "Name": "MasAccountId",
          "Value": "35"
        },
        {
          "Name": "SFCEnabled",
          "Value": "true"
        }
      ]
    },
    "domain": "QBO",
    "sparse": false,
    "Id": "1",
    "SyncToken": "4",
    "MetaData": {
      "CreateTime": "2016-01-13T01:07:08-08:00",
      "LastUpdatedTime": "2016-08-23T20:12:45-07:00"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/preferences?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Purchase ------------------------------ )
app.post('/purchaseCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "AccountRef": {
      "value": "42",
      "name": "Visa"
    },
    "PaymentType": "CreditCard",
    "Line": [
      {
        "Amount": 10.00,
        "DetailType": "AccountBasedExpenseLineDetail",
        "AccountBasedExpenseLineDetail": {
          "AccountRef": {
            "name": "Meals and Entertainment",
            "value": "13"
          }
        }
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchase?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/purchaseUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "AccountRef": {
      "value": "42",
      "name": "Visa"
    },
    "PaymentType": "CreditCard",
    "Credit": false,
    "TotalAmt": 100,
    "PurchaseEx": {
      "any": [
        {
          "name": "{http://schema.intuit.com/finance/v3}NameValue",
          "declaredType": "com.intuit.schema.finance.v3.NameValue",
          "scope": "javax.xml.bind.JAXBElement$GlobalScope",
          "value": {
            "Name": "TxnType",
            "Value": "54"
          },
          "nil": false,
          "globalScope": true,
          "typeSubstituted": false
        }
      ]
    },
    "domain": "QBO",
    "sparse": false,
    "Id": "175",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-23T22:52:14-07:00",
      "LastUpdatedTime": "2016-08-23T22:52:14-07:00"
    },
    "CustomField": [],
    "TxnDate": "2016-08-23",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "1",
        "Amount": 100,
        "DetailType": "AccountBasedExpenseLineDetail",
        "AccountBasedExpenseLineDetail": {
          "AccountRef": {
            "value": "13",
            "name": "Meals and Entertainment"
          },
          "BillableStatus": "NotBillable",
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchase?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/purchaseReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchase/175?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/purchaseDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "175",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchase?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/purchaseReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from purchase startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ PurchaseOrder ------------------------------ )
app.post('/purchaseOrderCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [{
      "Amount": 25.0,
      "DetailType": "ItemBasedExpenseLineDetail",
      "ItemBasedExpenseLineDetail": {
        "CustomerRef": {
          "value": "3",
          "name": "Cool Cars"
        },
        "BillableStatus": "NotBillable",
        "ItemRef": {
          "value": "11",
          "name": "Pump"
        },
        "UnitPrice": 25,
        "Qty": 1,
        "TaxCodeRef": {
          "value": "NON"
        }
      }
    }],
    "VendorRef": {
      "value": "41",
      "name": "Hicks Hardware"
    },
    "APAccountRef": {
      "value": "33",
      "name": "Accounts Payable (A/P)"
    },
    "TotalAmt": 25.0
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchaseorder?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/purchaseOrderUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "domain": "QBO",
    "sparse": false,
    "Id": "179",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-23T23:18:26-07:00",
      "LastUpdatedTime": "2016-08-23T23:18:26-07:00"
    },
    "CustomField": [
      {
        "DefinitionId": "1",
        "Name": "Crew #",
        "Type": "StringType"
      },
      {
        "DefinitionId": "2",
        "Name": "Sales Rep",
        "Type": "StringType"
      }
    ],
    "DocNumber": "1006-Updated",
    "TxnDate": "2016-08-23",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "1",
        "Amount": 25,
        "DetailType": "ItemBasedExpenseLineDetail",
        "ItemBasedExpenseLineDetail": {
          "CustomerRef": {
            "value": "3",
            "name": "Cool Cars"
          },
          "BillableStatus": "NotBillable",
          "ItemRef": {
            "value": "11",
            "name": "Pump"
          },
          "UnitPrice": 25,
          "Qty": 1,
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      }
    ],
    "VendorRef": {
      "value": "41",
      "name": "Hicks Hardware"
    },
    "APAccountRef": {
      "value": "33",
      "name": "Accounts Payable (A/P)"
    },
    "TotalAmt": 25
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchaseorder?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/purchaseOrderReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchaseorder/178?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/purchaseOrderDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "179",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/purchaseorder?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/purchaseOrderReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from purchaseorder startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ RefundReceipt ------------------------------ )
app.post('/refundReceiptCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [
      {
        "Amount": 420.00,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "2"
          }
        }
      }
    ],
    "DepositToAccountRef": {
      "value": "35",
      "name": "Checking"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/refundreceipt?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/refundReceiptUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "domain": "QBO",
    "sparse": false,
    "Id": "180",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-08-23T23:38:22-07:00",
      "LastUpdatedTime": "2016-08-23T23:38:22-07:00"
    },
    "CustomField": [
      {
        "DefinitionId": "1",
        "Name": "Crew #",
        "Type": "StringType"
      }
    ],
    "DocNumber": "1044-Updated",
    "TxnDate": "2016-08-23",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "1",
        "LineNum": 1,
        "Amount": 420,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "2",
            "name": "Hours"
          },
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      },
      {
        "Amount": 420,
        "DetailType": "SubTotalLineDetail",
        "SubTotalLineDetail": {}
      }
    ],
    "TxnTaxDetail": {
      "TotalTax": 0
    },
    "TotalAmt": 420,
    "HomeTotalAmt": 420,
    "ApplyTaxAfterDiscount": false,
    "PrintStatus": "NeedToPrint",
    "Balance": 0,
    "PaymentRefNum": "To Print",
    "DepositToAccountRef": {
      "value": "35",
      "name": "Checking"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/refundreceipt?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/refundReceiptDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "180",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/refundreceipt?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/refundReceiptReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/refundreceipt/66?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/refundReceiptReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from refundreceipt startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Reports ------------------------------ )
app.get('/reportAccountList', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/AccountList?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportAgedPayableDetail', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/AgedPayableDetail?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportAgedPayables', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/AgedPayables?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportAgedReceivableDetail', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/AgedReceivableDetail?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportAgedReceivables', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/AgedReceivables?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportBalanceSheet', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/BalanceSheet?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportCashFlow', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/CashFlow?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportCashSales', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/ClassSales?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportCustomerBalance', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/CustomerBalance?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportCustomerBalanceDetail', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/CustomerBalanceDetail?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportCustomerIncome', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/CustomerIncome?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportCustomerSales', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/CustomerSales?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportDepartmentSales', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/DepartmentSales?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportGeneralLedger', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/GeneralLedger?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportInventoryValuationSummary', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/InventoryValuationSummary?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportItemSales', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/ItemSales?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportProfitAndLoss', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/ProfitAndLoss?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportProfitAndLossDetail', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/ProfitAndLossDetail?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportTrialBalance', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/TrialBalance?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportTransactionList', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/TransactionList?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportVendorBalance', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/VendorBalance?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportVendorBalanceDetail', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/VendorBalanceDetail?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/reportVendorExpense', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/reports/VendorExpenses?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ SalesReceipt ------------------------------ )
app.post('/salesReceiptCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Line": [{
      "Id": "1",
      "LineNum": 1,
      "Description": "Pest Control Services",
      "Amount": 35.0,
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": {
          "value": "10",
          "name": "Pest Control"
        },
        "UnitPrice": 35,
        "Qty": 1,
        "TaxCodeRef": {
          "value": "NON"
        }
      }
    }]
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/salesreceipt?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/salesReceiptReadByID', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/salesreceipt/181?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/salesReceiptUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "domain": "QBO",
    "sparse": false,
    "Id": "181",
    "SyncToken": "0",
    "CustomField": [
      {
        "DefinitionId": "1",
        "Name": "Crew #",
        "Type": "StringType"
      }
    ],
    "DocNumber": "1045-Updated",
    "TxnDate": "2016-09-02",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "1",
        "LineNum": 1,
        "Description": "Pest Control Services",
        "Amount": 35,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "10",
            "name": "Pest Control"
          },
          "UnitPrice": 35,
          "Qty": 1,
          "TaxCodeRef": {
            "value": "NON"
          }
        }
      },
      {
        "Amount": 35,
        "DetailType": "SubTotalLineDetail",
        "SubTotalLineDetail": {}
      }
    ],
    "TxnTaxDetail": {
      "TotalTax": 0
    },
    "TotalAmt": 35,
    "HomeTotalAmt": 35,
    "ApplyTaxAfterDiscount": false,
    "PrintStatus": "NeedToPrint",
    "EmailStatus": "NotSet",
    "Balance": 0,
    "DepositToAccountRef": {
      "value": "4",
      "name": "Undeposited Funds"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/salesreceipt?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/salesReceiptDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "181",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/salesreceipt?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/salesReceiptReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from salesreceipt startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/salesReceiptVoid', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "sparse": true,
    "Id": "188",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/salesreceipt?include=void&minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ TaxAgency ------------------------------ )
app.post('/taxAgencyCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "DisplayName": "CityTaxAgency"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/taxagency?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/taxAgencyReadByID', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/taxagency/3?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/taxAgencyReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from taxagency startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ TaxCode ------------------------------ )
app.post('/taxCodeReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from taxcode startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/taxCodeReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/taxcode/2?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ TaxRate ------------------------------ )
app.post('/taxRateReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from taxrate startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/taxRateReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/taxrate/1?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ TaxService ------------------------------ )
app.post('/taxServiceCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "TaxCode": "MyTaxCodeName",
    "TaxRateDetails": [
      {
        "TaxRateName": "myNewTaxRateName",
        "RateValue": "8",
        "TaxAgencyId": "1",
        "TaxApplicableOn": "Sales"
      }
    ]
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/taxservice/taxcode?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Term ------------------------------ )
app.post('/termCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Term120",
    "DueDays": "120"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/term?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/termReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/term/8?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/termUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Term1120-Updated",
    "Active": true,
    "Type": "STANDARD",
    "DiscountPercent": 0,
    "DueDays": 120,
    "domain": "QBO",
    "sparse": false,
    "Id": "8",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/term?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/termDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Name": "Term1120-Updated",
    "Active": false,
    "Type": "STANDARD",
    "DiscountPercent": 0,
    "DueDays": 120,
    "domain": "QBO",
    "sparse": false,
    "Id": "8",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/term`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/termReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from term startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ TimeActivity ------------------------------ )
app.post('/timeActivityCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "NameOf": "Employee",
    "EmployeeRef": {
      "value": "55",
      "name": "Emily Platt"
    },
    "StartTime": "2015-07-05T08:00:00-08:00",
    "EndTime": "2013-07-05T17:00:00-08:00"
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/timeactivity?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/timeActivityUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "TxnDate": "2016-09-03",
    "NameOf": "Employee",
    "EmployeeRef": {
      "value": "55",
      "name": "Emily Platt"
    },
    "ItemRef": {
      "value": "2",
      "name": "Hours"
    },
    "BillableStatus": "NotBillable",
    "Taxable": false,
    "HourlyRate": 0,
    "StartTime": "2016-09-02T09:00:00-07:00",
    "EndTime": "2016-09-02T18:00:00-07:00",
    "domain": "QBO",
    "sparse": false,
    "Id": "6",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/timeactivity?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/timeActivityReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "TxnDate": "2016-09-03",
    "NameOf": "Employee",
    "EmployeeRef": {
      "value": "55",
      "name": "Emily Platt"
    },
    "ItemRef": {
      "value": "2",
      "name": "Hours"
    },
    "BillableStatus": "NotBillable",
    "Taxable": false,
    "HourlyRate": 0,
    "StartTime": "2016-09-02T09:00:00-07:00",
    "EndTime": "2016-09-02T18:00:00-07:00",
    "domain": "QBO",
    "sparse": false,
    "Id": "6",
    "SyncToken": "0"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/timeactivity?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/timeActivityDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "6",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/timeactivity?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/timeActivityReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from timeactivity startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Transfer ------------------------------ )
app.post('/transferCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "FromAccountRef": {
      "value": "35",
      "name": "Checking"
    },
    "ToAccountRef": {
      "value": "36",
      "name": "Savings"
    },
    "Amount": "120.00"
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/transfer?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/transferReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/transfer/184?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/transferUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "FromAccountRef": {
      "value": "35",
      "name": "Checking"
    },
    "ToAccountRef": {
      "value": "36",
      "name": "Savings"
    },
    "Amount": 120,
    "domain": "QBO",
    "sparse": false,
    "Id": "183",
    "SyncToken": "0",
    "TxnDate": "2016-09-03",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/transfer?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/transferDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "183",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/transfer?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/transferReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from transfer startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ Vendor ------------------------------ )
app.post('/vendorCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "BillAddr": {
      "Line1": "Dianne's Auto Shop",
      "Line2": "Dianne Bradley",
      "Line3": "29834 Mustang Ave.",
      "City": "Millbrae",
      "Country": "U.S.A",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94030"
    },
    "TaxIdentifier": "99-5688293",
    "AcctNum": "35372649",
    "Title": "Ms.",
    "GivenName": "Dianne",
    "FamilyName": "Bradley",
    "Suffix": "Sr.",
    "CompanyName": "Dianne's Auto Shop",
    "DisplayName": "Dianne's Auto Shop",
    "PrintOnCheckName": "Dianne's Auto Shop",
    "PrimaryPhone": {
      "FreeFormNumber": "(650) 555-2342"
    },
    "Mobile": {
      "FreeFormNumber": "(650) 555-2000"
    },
    "PrimaryEmailAddr": {
      "Address": "dbradley@myemail.com"
    },
    "WebAddr": {
      "URI": "http://DiannesAutoShop.com"
    }
  }

  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendor?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/vendorUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "BillAddr": {
      "Id": "111",
      "Line1": "Dianne's Auto Shop",
      "Line2": "Dianne Bradley",
      "Line3": "29834 Mustang Ave.",
      "City": "Millbrae",
      "Country": "U.S.A",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94030"
    },
    "TaxIdentifier": "XXXXXX8293",
    "Balance": 0,
    "AcctNum": "35372649",
    "Vendor1099": false,
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "domain": "QBO",
    "sparse": false,
    "Id": "70",
    "SyncToken": "0",
    "Title": "Ms.",
    "GivenName": "Dianne",
    "FamilyName": "Bradley",
    "Suffix": "Sr.",
    "CompanyName": "Dianne's Auto Shop",
    "DisplayName": "Dianne's Auto Shop-Updated",
    "PrintOnCheckName": "Dianne's Auto Shop",
    "Active": true,
    "PrimaryPhone": {
      "FreeFormNumber": "(650) 555-2342"
    },
    "Mobile": {
      "FreeFormNumber": "(650) 555-2000"
    },
    "PrimaryEmailAddr": {
      "Address": "dbradley@myemail.com"
    },
    "WebAddr": {
      "URI": "http://DiannesAutoShop.com"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendor?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/vendorReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendor/70?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/vendorDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "BillAddr": {
      "Id": "111",
      "Line1": "Dianne's Auto Shop",
      "Line2": "Dianne Bradley",
      "Line3": "29834 Mustang Ave.",
      "City": "Millbrae",
      "Country": "U.S.A",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94030"
    },
    "TaxIdentifier": "XXXXXX8293",
    "Balance": 0,
    "AcctNum": "35372649",
    "Vendor1099": false,
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "domain": "QBO",
    "sparse": false,
    "Id": "70",
    "SyncToken": "0",
    "Title": "Ms.",
    "GivenName": "Dianne",
    "FamilyName": "Bradley",
    "Suffix": "Sr.",
    "CompanyName": "Dianne's Auto Shop",
    "DisplayName": "Dianne's Auto Shop-Updated",
    "PrintOnCheckName": "Dianne's Auto Shop",
    "Active": false,
    "PrimaryPhone": {
      "FreeFormNumber": "(650) 555-2342"
    },
    "Mobile": {
      "FreeFormNumber": "(650) 555-2000"
    },
    "PrimaryEmailAddr": {
      "Address": "dbradley@myemail.com"
    },
    "WebAddr": {
      "URI": "http://DiannesAutoShop.com"
    }
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendor`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/vendorReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from vendor startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


//------------------------------ VendorCredit ------------------------------ )
app.post('/vendorCreditReadAll', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "select * from vendorcredit startposition 1 maxresults 5"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/query?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/vendorCreditCreate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "TxnDate": "2014-12-23",
    "Line": [
      {
        "Id": "1",
        "Amount": 90.00,
        "DetailType": "AccountBasedExpenseLineDetail",
        "AccountBasedExpenseLineDetail":
        {
          "CustomerRef":
          {
            "value": "1",
            "name": "Amy's Bird Sanctuary"
          },
          "AccountRef":
          {
            "value": "8",
            "name": "Bank Charges"
          },
          "BillableStatus": "Billable",
          "TaxCodeRef":
          {
            "value": "TAX"
          }
        }
      }
    ],
    "VendorRef":
    {
      "value": "30",
      "name": "Books by Bessie"
    },
    "APAccountRef":
    {
      "value": "33",
      "name": "Accounts Payable (A/P)"
    },
    "TotalAmt": 90.00
  }


  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendorcredit?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/vendorCreditUpdate', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "domain": "QBO",
    "sparse": false,
    "Id": "185",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2016-09-02T03:09:34-07:00",
      "LastUpdatedTime": "2016-09-02T03:09:34-07:00"
    },
    "TxnDate": "2014-04-23",
    "CurrencyRef": {
      "value": "USD",
      "name": "United States Dollar"
    },
    "ExchangeRate": 1,
    "Line": [
      {
        "Id": "1",
        "Amount": 90,
        "DetailType": "AccountBasedExpenseLineDetail",
        "AccountBasedExpenseLineDetail": {
          "CustomerRef": {
            "value": "1",
            "name": "Amy's Bird Sanctuary"
          },
          "AccountRef": {
            "value": "8",
            "name": "Bank Charges"
          },
          "BillableStatus": "Billable",
          "TaxCodeRef": {
            "value": "TAX"
          }
        }
      }
    ],
    "VendorRef": {
      "value": "30",
      "name": "Books by Bessie"
    },
    "APAccountRef": {
      "value": "33",
      "name": "Accounts Payable (A/P)"
    },
    "TotalAmt": 90
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendorcredit?minorversion=${minorversion}`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.get('/vendorCreditReadById', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = "undefined"
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendorcredit/185?minorversion=${minorversion}`, method: "get", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});


app.post('/vendorCreditDelete', (req, res) => {
  const companyID = process.env.REALM_ID
  let exampleBody = {
    "Id": "185",
    "SyncToken": "1"
  }
  if (req.body?.example) {
    req.body = { q: exampleBody }
  }
  req.params.body = req.body

  const baseurl =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${baseurl}v3/company/${companyid}/vendorcredit?operation=delete`, method: "post", body: req.body })
    .then(function (authResponse) {
      console.log(authResponse)

      res.send(authResponse)
    })
    .catch(function (e) {
      console.error(e);
    });
});






const server = app.listen(
  PORT,
  console.log(`\nServer running in ${process.env.NODE_ENV} on port ${PORT}`), () => {
    redirectUri = `${server.address().port}` + '/callback';
    console.log(redirectUri)
  }
);