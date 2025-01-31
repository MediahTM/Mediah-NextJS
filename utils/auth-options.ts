import { NextAuthOptions } from "next-auth"
import DiscordProvider, { DiscordProfile } from "next-auth/providers/discord";
import { JWT } from "next-auth/jwt";
import db from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID || '',
            clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
            profile(profile: DiscordProfile) {
                return {
                    id: profile.id,
                    name: profile.username,
                    email: profile.email,
                    image: profile.avatar
                        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                        : null,
                    banner_color: profile.banner_color || null,
                    isReferral: false,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (account && user) {
                let dbUser = await db.user.findUnique({
                    where: { email: user.email ?? '' },
                });
  
                if (!dbUser) {
                    dbUser = await db.user.create({
                        data: {
                            email: user.email!,
                            name: user.name ?? profile?.name ?? "Unknown User",
                            image: user.image,
                            discordId: account.providerAccountId,
                        },
                    });
                }
                else {
                    dbUser = await db.user.update({
                        where: { id: dbUser.id },
                        data: {
                            email: user.email!,
                            name: user.name ?? profile?.name ?? "Unknown User",
                            image: user.image,
                            discordId: account.providerAccountId,
                        },
                    });
                }
                token.id = dbUser.id;
                token.email = dbUser.email;
                token.name = dbUser.name;
                token.image = dbUser.image;
                token.discordId = dbUser.discordId;
                token.referral = dbUser.referral ?? false;
                token.createdAt = dbUser.createdAt;
                token.fetchedAt = Date.now();
            }
            if (!token.fetchedAt) token.fetchedAt = Date.now();
            if (Date.now() - (token.fetchedAt as number) > 1000 * 60 * 1) {
                const dbUser = await db.user.findUnique({
                    where: { email: token.email ?? '' },
                })
                if (dbUser) {
                    token.id = dbUser.id;
                    token.email = dbUser.email;
                    token.name = dbUser.name;
                    token.image = dbUser.image;
                    token.discordId = dbUser.discordId;
                    token.referral = dbUser.referral ?? false;
                    token.createdAt = dbUser.createdAt;
                    token.fetchedAt = Date.now();
                }
            }
            return token;
        },
  
        async session({ session, token }: { session: any, token: JWT }) {
            if (token) {
                session.user = {
                    email: token.email as string,
                    name: token.name as string,
                    image: token.image as string,
                    id: token.id,
                    discordId: token.discordId,
                    isReferral: token.referral ?? false,
                    createdAt: token.createdAt
                };
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error'
    }
  };
  