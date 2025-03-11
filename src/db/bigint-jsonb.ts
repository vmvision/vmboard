import { customType } from 'drizzle-orm/pg-core';
import JSONbig from 'json-bigint';

const bigintJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return 'jsonb';
    },
    toDriver(value: TData): string {
      return JSONbig.stringify(value);
    },
    fromDriver(value: string): TData {
      return JSONbig.parse(value) as TData;
    },
  })(name);

export default bigintJsonb;
