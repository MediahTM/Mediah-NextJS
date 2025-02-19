import type { Metadata } from "next/types";

import Container from "@/components/ui/container";
import PageTitle from "@/components/ui/page-title";
import DetailsView from "./statistics-view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";

export const metadata: Metadata = {
    title: "Dashboard",
};

const Dashboard = async () => {
    const session = await getServerSession(authOptions);

    return (
        <Container>
            <PageTitle title="Dashboard" description='An overview of your statistics' />
            <div className="space-y-4">
                <DetailsView session={session} />
            </div>
        </Container>
    )
}

export default Dashboard