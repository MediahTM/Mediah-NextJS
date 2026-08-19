export default function parseCorsProxyBody(body: string) {
    return JSON.parse(body).body;
}