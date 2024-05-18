// deno-lint-ignore no-explicit-any
export type bson_doc = unknown[] | Record<string, any>;

export type bson_state = { b: Uint8Array; i: number };

export type bson_values =
  | bigint
  | boolean
  | bson_binary
  | bson_dbpointer
  | bson_decimal128
  | bson_doc
  | bson_objectid
  | bson_scoped_code
  | Date
  | null
  | number
  | string
  | undefined;

export interface bson_binary {
  [bson_symbol]: "binary";
  type: number;
  data: Uint8Array;
}

export interface bson_dbpointer {
  [bson_symbol]: "dbpointer";
  ref: string;
  oid: string;
}

export interface bson_decimal128 {
  [bson_symbol]: "decimal128";
  data: number[];
}

export interface bson_objectid {
  [bson_symbol]: "objectid";
  oid: string;
}

export interface bson_scoped_code {
  [bson_symbol]: "scoped_code";
  scope: bson_doc;
  code: string;
}

export enum bson_types {
  double = 1,
  string = 2,
  object = 3,
  array = 4,
  binary = 5,
  /** @deprecated */
  undefined = 6,
  objectId = 7,
  boolean = 8,
  date = 9,
  null = 10,
  regex = 11,
  /** @deprecated */
  dbpointer = 12,
  javascript = 13,
  /** @deprecated */
  symbol = 14,
  /** @deprecated */
  scopedjavascript = 15,
  int32 = 16,
  timestamp = 17,
  int64 = 18,
  decimal128 = 19,
  minkey = -1,
  maxkey = 127,
}

export const bson_symbol = Symbol("new_bson");
