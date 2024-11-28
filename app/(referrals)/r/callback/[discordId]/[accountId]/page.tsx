import { authOptions } from "@/utils/authOptions";
import { getServerSession } from 'next-auth'
import db from '@/lib/prisma'
import { redirect } from 'next/navigation'

type Params = { 
    accountId: string
    discordId: string
}

const ReferralCallback = async ({ params }: { params: Promise<Params> } ) => {
    const { accountId, discordId } = await params;
    const session = await getServerSession(authOptions);
    const creationTimestamp = Date.parse(session?.user?.createdAt as string)
    if (Date.now() - creationTimestamp < 1000 * 60 * 2) {
        await db.user.update({
            where: { id: atob(accountId), discordId: discordId },
            data: { referral: true }
        })
    }
    redirect(process.env.BASEPATH!);
    return;
}

export default ReferralCallback