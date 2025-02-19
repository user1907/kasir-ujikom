import { usersSchema } from "@/server/db/schema";
import { z } from "zod";

export const LoginSchema = usersSchema.pick({ username: true, password: true });

export const UserCreateSchema = usersSchema.pick({ name: true, username: true, password: true, level: true });

export const UserUpdateSchema = usersSchema.pick({ id: true })
  .merge(
    usersSchema.pick({ name: true, username: true, level: true }).partial()
  )
  .and(
    usersSchema.pick({ password: true }).partial().or(z.object({ password: z.literal("") }).partial())
  );
