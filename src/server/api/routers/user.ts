import { UserCreateSchema, UserUpdateSchema } from "@/schemas";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { users, usersSchema } from "@/server/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { jwt } from "@/lib/jwt";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  create: adminProcedure
    .input(UserCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const password = await hash(input.password);

      return ctx.db
        .insert(users)
        .values({ ...input, password })
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          level: users.level
        });
    }),

  read: protectedProcedure
    .query(({ ctx }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = ctx.user;

      return user;
    }),

  update: protectedProcedure
    .input(UserUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, password, ...payload } = input;

      if (id !== ctx.user.id && ctx.user.level !== "administrator") throw new TRPCError({ code: "FORBIDDEN", message: "Anda tidak mempunyai izin untuk mengubah user ini!" });
      if (payload.level !== ctx.user.level && ctx.user.level !== "administrator") throw new TRPCError({ code: "FORBIDDEN", message: "Anda tidak mempunyai izin untuk mengubah level user!" });

      const updated: typeof payload & { password?: typeof input["password"], passwordUpdatedAt?: typeof users.$inferInsert["passwordUpdatedAt"] } = { ...payload };

      if (password !== undefined && password !== "") {
        console.log("Harusnya gak ke update");
        updated.password = await hash(password);
        // Set passwordUpdatedAt to 1 second ago to force re-authentication
        updated.passwordUpdatedAt = new Date(Date.now() - 1000);

        // If user is updating their own password, we need to re-authenticate them
        if (id === ctx.user.id) {
          ctx.cookies.set("session", jwt.sign({ id }), { httpOnly: true });
        }
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
    }),

  delete: adminProcedure
    .input(usersSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const append = `_deleted-${Math.floor(Math.random() * 1000)}`;

      return ctx.db
        .update(users)
        .set({ deleted: true, username: sql`${users.username} || ${append}` })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          level: users.level
        });
    }),

  list: adminProcedure
    .input(z.object({ includeDeleted: z.boolean().default(false).optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const userList = await ctx.db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            level: users.level
          })
          .from(users)
          .where(eq(users.deleted, input.includeDeleted === true))
          .orderBy(asc(users.id));

        return userList;
      }
      catch (error) {
        console.error(`[USER_LIST]: ${(error as Error).message}`);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: (error as Error).message });
      }
    })
});
