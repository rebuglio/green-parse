/*
  Green-Parse! https://github.com/rebuglio/green-parse
  Parse (... and verify signature) a Green Pass in pure-JS

  porting from: https://github.com/hannob/vacdec
*/

const base45 = require('base45')
const pako = require('pako')
const {webcrypto, verify, cbor} = require("cosette/build/sign");

// use keys.json for real certificate,
// use testkeys.json to validate italian test data (https://github.com/eu-digital-green-certificates/dgc-testdata/tree/main/IT)
const x509 = require('./certs/testkeys.json');

// keys.json take from french official app "sanipasse": https://raw.githubusercontent.com/lovasoa/sanipasse/master/src/assets/Digital_Green_Certificate_Signing_Keys.json

(async () => {

  const qrcode = "HC1:6BFOXN%TS3DH0YOJ58S S-W5HDC *M0II5XHC9B5G2+$N IOP-IA%NFQGRJPC%OQHIZC4.OI1RM8ZA.A5:S9MKN4NN3F85QNCY0O%0VZ001HOC9JU0D0HT0HB2PL/IB*09B9LW4T*8+DCMH0LDK2%K:XFE70*LP$V25$0Q:J:4MO1P0%0L0HD+9E/HY+4J6TH48S%4K.GJ2PT3QY:GQ3TE2I+-CPHN6D7LLK*2HG%89UV-0LZ 2ZJJ524-LH/CJTK96L6SR9MU9DHGZ%P WUQRENS431T1XCNCF+47AY0-IFO0500TGPN8F5G.41Q2E4T8ALW.INSV$ 07UV5SR+BNQHNML7 /KD3TU 4V*CAT3ZGLQMI/XI%ZJNSBBXK2:UG%UJMI:TU+MMPZ5$/PMX19UE:-PSR3/$NU44CBE6DQ3D7B0FBOFX0DV2DGMB$YPF62I$60/F$Z2I6IFX21XNI-LM%3/DF/U6Z9FEOJVRLVW6K$UG+BKK57:1+D10%4K83F+1VWD1NE"

  // remove prefix
  const b45data = qrcode.replace("HC1:", "")

  // decode from base45
  const zlibdata = base45.decode(b45data)

  // unzip with zLib
  const cwt = pako.inflate(zlibdata)

  /*
    decode CWT - Cbor Web Token scheme:
    - 0 => Protected header, cbor encoded. Format: {1:alg, 4:kid}
    - 1 => Unprotected header (empty)
    - 2 => Payload (enc_payload), cbor encoded
    - 3 => Signature
   */
  const cbor_payload = await verify(cwt, async (kid) => {
    const cert = x509[kid.toString('base64')];
    return {key: await webcrypto.subtle.importKey(
          'spki',
          Buffer.from(cert.publicKeyPem, 'base64'),
          cert.publicKeyAlgorithm,
          true, ['verify']
      )}
  })

  /*
    decode green pass payload (cbor again)

    Payload scheme:
    - 1 => Issuer (iss, claim key 1, optional, ISO 3166-1 alpha-2 of issuer)
    - 6 => Issued At (iat, claim key 6)
    - 4 => Expiration Time (exp, claim key 4)
    - -260 => Health Certificate (hcert, claim key -260)
   */
  const payload = cbor.decodeFirstSync(cbor_payload)

  console.log(map2obj(payload))

})();

function map2obj (map) { return map instanceof Map ?
    Object.fromEntries([...map.keys()].map(
        k => [k, map2obj(map.get(k))])) : map }
