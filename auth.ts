import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import PgAdapter from "@auth/pg-adapter";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PgAdapter(pool),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
});