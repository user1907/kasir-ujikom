import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { users, usersSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { verify } from "@node-rs/argon2";
import { jwt } from "@/lib/jwt";

export const sessionRouter = createTRPCRouter({
  create: publicProcedure
    .input(usersSchema.pick({ username: true, password: true }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .where(
          eq(users.username, input.username)
        );

      // Check if user exists and password is correct
      if (user.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      if (await verify(user[0]!.password, input.password) === false) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });

      ctx.cookies.set("session", jwt.sign({ id: user[0]!.id }), { httpOnly: true });

      return { name: user[0]!.name };
    }),

  read: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.user;
    })
});
