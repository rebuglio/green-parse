Green PaRsE
===

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pure-JS Green Pass Reader - EU Digital COVID Certificates (EUDCC) Reader

Porting from [vacdec](https://github.com/hannob/vacdec) by hannob.

Information about generated JSON: [covid-certificate_json_specification_en.pdf]( https://ec.europa.eu/health/sites/default/files/ehealth/docs/covid-certificate_json_specification_en.pdf)

Dati di test: [Link](https://github.com/eu-digital-green-certificates/dgc-testdata/tree/main/IT) 

## Demo

[certverde.it](https://certverde.it)

## The Code

```
// Remove header
const b45data = ascii_from_qrcode.replace("HC1:", "")

// Decode from base45
const zlibdata = base45.decode(b45data)

// Unzip with zLib
const cbordata = pako.inflate(zlibdata)

// CBOR Web Token
const cb = cbor.decodeFirstSync(cbordata)

// EU Digital COVID Certificate in "Map" format
const payload = cbor.decodeFirstSync(cb.value[2])

// if you prefer javascript object (key => value) format, take a look of map2obj in  green-parse.js
```

## Dependencies

Package.json format:

```
"base45": "^3.0.0",
"cbor-web": "^8.0.1",
"pako": "^2.0.4",
```



