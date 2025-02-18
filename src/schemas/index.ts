import { usersSchema } from "@/server/db/schema";

export const LoginSchema = usersSchema.pick({ username: true, password: true });

export const UserCreateSchema = usersSchema.pick({ name: true, username: true, password: true, level: true });

export const UserUpdateSchema = usersSchema.pick({ id: true })
  .and(usersSchema.pick({ name: true, username: true, password: true, level: true }).partial());

export const UserUpdateSchemaWithoutLevel = usersSchema.pick({ id: true })
  .and(usersSchema.pick({ name: true, username: true, password: true }).partial());
