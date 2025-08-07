import { getServerSession, Session } from 'next-auth';
import { authOptions } from './auth-options';

// Session authentication for API routes

type AuthenticatedSession = Session & { user: NonNullable<Session['user']> };

export async function getAuthenticatedSession() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error('User is not authenticated.');
    }
    return session as AuthenticatedSession;
}
