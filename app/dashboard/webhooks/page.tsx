import type { Metadata } from "next/types";
import WebhooksView from "./view";

export const metadata: Metadata = {
    title: "Webhooks",
}

const WebhooksPage = () => {
    return (
        <>
            <WebhooksView />
        </>
    )
}

export default WebhooksPage