import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
    interface User extends DefaultUser {
        id: string;
        isReferral: boolean;
    }
    interface Session {
        user?: {
            id: string;
            isReferral: boolean,
        } & DefaultSession['user'];
    }
}