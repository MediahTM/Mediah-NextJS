"use client"

import Container from "@/components/ui/container";
import PageTitle from "@/components/ui/page-title";
import DetailsView from "./statistics-view";
import { useSession } from "next-auth/react";

const Dashboard = () => {
    const { data: session } = useSession();

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