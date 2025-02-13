import { usersSchema } from "@/server/db/schema";

export const LoginSchema = usersSchema.pick({ username: true, password: true });
