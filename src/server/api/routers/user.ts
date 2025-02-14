import { UserUpdateSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";

export const userRouter = createTRPCRouter({
  read: protectedProcedure
    .query(({ ctx }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = ctx.user;

      return user;
    }),

  update: protectedProcedure
    .input(UserUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.id !== ctx.user.id && ctx.user.level !== "administrator") throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to modify this user" });
      if (input.level !== undefined && ctx.user.level !== "administrator") throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to modify user levels" });

      const updated: typeof input & { passwordUpdatedAt?: typeof users.$inferInsert["passwordUpdatedAt"] } = { ...input };

      if (updated.password !== undefined) {
        updated.password = await hash(updated.password);
        updated.passwordUpdatedAt = new Date();
      }

      return ctx.db
        .update(users)
        .set(updated)
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          level: users.level,
          passwordUpdatedAt: users.passwordUpdatedAt
        });
    })
});
