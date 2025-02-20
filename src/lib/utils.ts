import { clsx, type ClassValue } from "clsx";
import { sql, type SQL } from "drizzle-orm";
import { type PgColumn } from "drizzle-orm/pg-core";
import { type ProcedureUseQuery } from "node_modules/@trpc/react-query/dist/createTRPCReact";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AssertNotUndefined<T> = T extends undefined ? never : T;

export type InferQueryOutput<TQuery> = TQuery extends ProcedureUseQuery<infer R> ? R["output"] : never;
export type InferQueryInput<TQuery> = TQuery extends ProcedureUseQuery<infer R> ? R["input"] : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferQueryResult<TQueryResult> = TQueryResult extends { data: any } ? TQueryResult["data"] : never;

export function getTableNameFromColumn(column: PgColumn) {
  const symbol = Object.getOwnPropertySymbols(column.table).find(s => s.description === "drizzle:Name");

  // @ts-expect-error - This is a private property
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return column.table[symbol];
}

export function selectArray<T>(columnName: string, columns: Record<string, PgColumn>): SQL<T[]> {
  const mappedColumns = Object.entries(columns).map(([key, value]) => `'${key}', "${getTableNameFromColumn(value)}"."${value.name}"`);

  return sql.raw(`json_agg(json_build_object(${mappedColumns.join(", ")})) as ${columnName}`) as SQL<T[]>;
}
