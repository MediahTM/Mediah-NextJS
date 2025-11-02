import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Webhook } from '@prisma/client';
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const WebhooksContext = createContext<{
    loading: boolean,
    fetching: boolean,
    refetching: boolean,
    fetchWebhooks: () => void;
    webhooks: Webhook[],
    setWebhooks: React.Dispatch<React.SetStateAction<Webhook[]>>
} | undefined>(undefined);

export const WebhooksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const session = useSession();
    const { data, isLoading: loading, refetch: fetchWebhooks, isFetching: fetching, isRefetching: refetching } = useQuery({
        queryKey: ["webhooks"],
        enabled: true,
        refetchOnWindowFocus: false,
        queryFn: async () => {
            if (session.status !== "authenticated") return;
            const webhookResponse = await axios.get("/api/webhooks");
            if (!webhookResponse.data.success) {
                toast.error(`Could not fetch webhooks: '${webhookResponse.statusText}'`);
                return [];
            }
            return webhookResponse.data.data;
        }
    });

    useEffect(() => {
        if (data && data.length > 0) {
            setWebhooks(data);
        }
    }, [data])
    return (
        <WebhooksContext.Provider value={{ webhooks, setWebhooks, loading, fetching, refetching, fetchWebhooks }}>
            {children}
        </WebhooksContext.Provider>
    );
}

export const useWebhooks = () => {
    const context = useContext(WebhooksContext);

    if (!context) {
        throw new Error('useWebhooks must be used within a WebhooksContext');
    }

    return context;
};