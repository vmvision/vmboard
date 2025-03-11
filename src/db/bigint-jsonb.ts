import { customType } from "drizzle-orm/pg-core";
import JSONbig from "json-bigint";

const JSONBigInt = JSONbig({
  storeAsString: true,
  protoAction: "preserve",
  constructorAction: "preserve",
});

const bigintJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "jsonb";
    },
    toDriver(value: TData): string {
      return JSONBigInt.stringify(value);
    },
    fromDriver(value: string): TData {
      return JSONBigInt.parse(JSON.stringify(value)) as TData;
    },
  })(name);

export default bigintJsonb;
