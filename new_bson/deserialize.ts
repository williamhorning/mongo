import { decode } from "./_decode_handlers.ts";
import { bson_symbol, bson_types, type bson_doc, type bson_state } from "./types.ts";

/**
 * deserialize a bson document from a Uint8Array
 * @param b - the Uint8Array to deserialize
 * @param is_array - whether the root document is an array or not
 */
export function deserialize(b: Uint8Array, is_array: boolean = false): bson_doc {
  const s = { b, i: 0 } as bson_state;
  let array_index = 0;
  const size = decode.int32(s);

  if (size < 5 || b.byteLength < 5 || size > b.byteLength) {
    throw new Error(
      `invalid bson length, must be between 5 and ${b.length} bytes. claims to be ${size} bytes.`
    );
  }

  // deno-lint-ignore no-explicit-any
  const result = is_array ? ([] as unknown[]) : ({} as Record<string, any>);

  while (true) {
    const type = b[s.i++];

    if (type === 0 || !type) break;

    const key_string = decode.cstring(s);
    const key = is_array ? array_index++ : key_string;

    let val;

    if (type === bson_types.objectId) {
      val = decode.objectid(s);
    } else if (type === bson_types.int32) {
      val = decode.int32(s);
    } else if (type === bson_types.boolean) {
      val = b[s.i++] === 1;
    } else if (type === bson_types.undefined) {
      val = undefined;
    } else if (type === bson_types.null) {
      val = null;
    } else if (type === bson_types.decimal128) {
      val = decode.decimal128(s);
    } else if (type === bson_types.binary) {
      val = decode.binary(s);
    } else if (type === bson_types.scopedjavascript) {
      val = decode.scoped_code(s);
    } else if (type === bson_types.dbpointer) {
      val = decode.dbpointer(s);
    } else if (type === bson_types.regex) {
      val = {
        [bson_symbol]: "regexp" as const,
        $data: new RegExp(decode.cstring(s), decode.cstring(s)),
      };
    } else if (type === bson_types.timestamp) {
      val = decode.uint64(s)
    } else if (type === bson_types.double) {
      val = decode.fint64(s);
    }else if (type === bson_types.minkey) {
      val = { [bson_symbol]: "minkey" as const };
    } else if (type === bson_types.maxkey) {
      val = { [bson_symbol]: "maxkey" as const };
    } else if (type === bson_types.object || type === bson_types.array) {
      val = decode.document(s, type === bson_types.array);
    } else if (
      type === bson_types.int64 ||
      type === bson_types.date
    ) {
      val = decode.int64(s, type === bson_types.date);
    } else if (
      type === bson_types.string ||
      type === bson_types.javascript ||
      type === bson_types.symbol
    ) {
      val = decode.string(s);
    } else {
      throw new Error(`invalid bson type ${type} at index ${s.i}`);
    }

    result[key as keyof typeof result] = val;
  }

  return result;
}
