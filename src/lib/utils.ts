import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AssertNotUndefined<T> = T extends undefined ? never : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryResultType<TQuery> = TQuery extends { data: any } ? TQuery["data"] : never;
