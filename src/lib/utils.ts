import { clsx, type ClassValue } from "clsx";
import { type ProcedureUseQuery } from "node_modules/@trpc/react-query/dist/createTRPCReact";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AssertNotUndefined<T> = T extends undefined ? never : T;

export type InferQueryOutput<TQuery> = TQuery extends ProcedureUseQuery<infer R> ? R["output"] : never;
export type InferQueryInput<TQuery> = TQuery extends ProcedureUseQuery<infer R> ? R["input"] : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryResultType<TQueryResult> = TQueryResult extends { data: any } ? TQueryResult["data"] : never;
