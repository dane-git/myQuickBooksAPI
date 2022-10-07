const ps = require('./postman.json')


const fs = require('fs')
const writer = fs.createWriteStream('quickBooksAPI.js', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
const writeLine = (line) => writer.write(`\n${line}`)

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}


let ln = ''
for (let [k, v] of Object.entries(ps.item)) {
  ln = (`//------------------------------ ${v.name} ------------------------------ )`)
  writeLine(ln)
  // console.log(k, v)
  for (let endpoint of v.item) {

    let endpointName = camelize(endpoint.name.replaceAll('-', ' '));
    console.log(endpointName)
    console.log(endpoint)
    let exampleBody
    if (endpoint.request.body?.raw && !(endpoint.request.body.raw).toLowerCase().includes("select * from")) {
      console.log('\\n seen...')
      exampleBody = endpoint.request.body?.raw
    } else {
      console.log('\\n not seen...', endpoint.request.body?.raw.includes("\\n"))
      console.log(endpoint.request.body?.raw)
      console.log(endpoint.request.body?.raw.includes("\\n"))
      exampleBody = '"' + endpoint.request.body?.raw + '"'
    }
    // let result = text.replace(/blue/g, "red");
    let thisURL = endpoint.request.url.raw.replace(/({{)/g, "${").replace(/(}})/g, "}").replace('https://', '').replace('/v3/', 'v3/')
    ln = `app.${endpoint.request.method.toLowerCase()}('/${endpointName}', (req, res) => {
        const companyID = process.env.REALM_ID 
        let exampleBody = ${exampleBody}
        if(req.body?.example) {
          req.body = {q: exampleBody}
        }
        req.params.body = req.body

        const baseurl =
          oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

      oauthClient
        .makeApiCall({ url: \`${thisURL}\` , method: "${endpoint.request.method.toLowerCase()}", body: req.body})
        .then(function (authResponse) {
          console.log(authResponse)
          
          res.send(authResponse)
        })
        .catch(function (e) {
          console.error(e);
        });
      });
      \n`
    writeLine(ln)
    // console.log(endpoint.name)

  }
}