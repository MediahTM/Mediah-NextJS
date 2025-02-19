import type { Metadata } from "next/types";
import ReferralsView from "./view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";

export const metadata: Metadata = {
    title: "Referrals",
}

const ReferralsPage = async () => {
    const session = await getServerSession(authOptions);
    return (
        <>
            <ReferralsView session={session} />
        </>
    )
}

export default ReferralsPage