// TODO: replace with new bson lib
export {
  ObjectId as realObjectId, serialize
} from "jsr:@lucsoft/web-bson@^0.3.1";
export { crypto as stdCrypto } from "jsr:@std/crypto@^0.224.0/crypto";
export { decodeBase64, encodeBase64 } from "jsr:@std/encoding@^0.224.0/base64";
export { encodeHex } from "jsr:@std/encoding@^0.224.0/hex";
export { deserialize, type bson_objectid as ObjectId } from "./new_bson/mod.ts";
