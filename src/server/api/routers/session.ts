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
      try {
        const user = await ctx.db
          .select()
          .from(users)
          .where(
            eq(users.username, input.username)
          );

        // Check if user exists and password is correct
        if (user.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "Kredensial tidak valid" });
        if (await verify(user[0]!.password, input.password) === false) throw new TRPCError({ code: "UNAUTHORIZED", message: "Kredensial tidak valid" });

        ctx.cookies.set("session", jwt.sign({ id: user[0]!.id }), { httpOnly: true });

        return { name: user[0]!.name };
      }
      catch (error) {
        console.error(`[SESSION_CREATE]: ${(error as Error).message}`);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: (error as Error).message });
      }
    }),

  read: protectedProcedure
    .query(async ({ ctx }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = ctx.user;

      return user;
    }),

  delete: protectedProcedure
    .mutation(async ({ ctx }) => {
      ctx.cookies.set("session", "", { httpOnly: true });

      return { success: true };
    })
});
