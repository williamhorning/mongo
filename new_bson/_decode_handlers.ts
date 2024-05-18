import { deserialize } from "./deserialize.ts";
import {
  bson_symbol,
  type bson_binary,
  type bson_dbpointer,
  type bson_decimal128,
  type bson_doc,
  type bson_objectid,
  type bson_scoped_code,
  type bson_state,
} from "./types.ts";

const _dcdr = new TextDecoder();

export const decode = {
  binary(s: bson_state): bson_binary {
    const len = decode.int32(s);
    const type = s.b[s.i++];
    const data = s.b.slice(s.i, s.i + len);
    s.i += len;
    return { [bson_symbol]: "binary" as const, type, data };
  },
  cstring(s: bson_state): string {
    const start = s.i;
    while (s.b[s.i + 1] !== 0) s.i++;
    s.i += 2;
    return _dcdr.decode(s.b.slice(start, s.i - 1));
  },
  dbpointer(s: bson_state): bson_dbpointer {
    return {
      [bson_symbol]: "dbpointer" as const,
      ref: decode.string(s),
      oid: decode.objectid(s).oid,
    };
  },
  decimal128(s: bson_state): bson_decimal128 {
    // TODO: proper decimal128 deserialization?
    const data = Array.from(s.b.slice(s.i, s.i + 16));
    s.i += 16;
    return { [bson_symbol]: "decimal128" as const, data };
  },
  document(s: bson_state, array = false): bson_doc {
    const size = decode.int32(s);
    s.i += size - 4;
    return deserialize(s.b.slice(s.i - size, s.i + 4), array);
  },
  fint64(s: bson_state): number | bigint {
    s.i += 8;
    return new DataView(s.b.buffer.slice(s.i - 8, s.i)).getFloat64(0, true);
  },
  int32(s: bson_state): number {
    s.i += 4;
    return new DataView(s.b.buffer, s.i - 4, 4).getInt32(0, true);
  },
  int64(s: bson_state, date?: boolean): number | bigint | Date {
    s.i += 8;
    const int = new DataView(s.b.buffer.slice(s.i - 8, s.i)).getBigInt64(0, true);
    const safe = int > Number.MAX_SAFE_INTEGER || int < Number.MIN_SAFE_INTEGER;
    return date ? new Date(Number(int)) : safe ? Number(int) : int;
  },
  objectid(s: bson_state): bson_objectid {
    s.i += 12;
    return {
      [bson_symbol]: "objectid" as const,
      oid: Array.from(s.b.slice(s.i - 12, s.i))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
    };
  },
  scoped_code(s: bson_state): bson_scoped_code {
    const fin = s.i + decode.int32(s) - 4;
    const val = {
      [bson_symbol]: "scoped_code" as const,
      scope: deserialize(s.b.slice(s.i, fin)),
      code: decode.string(s),
    };
    s.i = fin + 1;
    return val;
  },
  string(s: bson_state): string {
    const size = decode.int32(s);
    s.i += size;
    return _dcdr.decode(s.b.slice(s.i - size, s.i - 1));
  },
  uint64(s: bson_state): number | bigint {
    s.i += 8;
    const int = new DataView(s.b.buffer.slice(s.i - 8, s.i)).getBigUint64(0, true);
    const safe = int > Number.MAX_SAFE_INTEGER || int < Number.MIN_SAFE_INTEGER;
    return safe ? Number(int) : int;
  }
};
