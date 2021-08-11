
/*
  Green-Parse! https://github.com/rebuglio/green-parse
  Parse a Green Pass in pure-JS

  porting from: https://github.com/hannob/vacdec
*/

const b45data = ascii_from_qrcode.replace("HC1:", "")
const zlibdata = base45.decode(b45data)
const cbordata = pako.inflate(zlibdata)

// CBOR Web Token
const cb = cbor.decodeFirstSync(cbordata)

// EU Digital COVID Certificate
const payload = cbor.decodeFirstSync(cb.value[2])

// If u need a key => value obj...
const obj_payload = map2obj(payload)


const map2obj = map => map instanceof Map ?
    Object.fromEntries([...map.keys()].map(
        k => [k, map2obj(map.get(k))])) : map