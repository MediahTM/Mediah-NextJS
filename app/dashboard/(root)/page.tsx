"use client";

import Container from "@/components/ui/container";
import PageTitle from "@/components/ui/page-title";
import DetailsView from "./statistics-view";

const Dashboard = () => {
    return (
        <Container>
            <PageTitle title="Dashboard" description='View your statistics' />
            <div className="space-y-4">
                <DetailsView />
            </div>
        </Container>
    )
}

export default Dashboard