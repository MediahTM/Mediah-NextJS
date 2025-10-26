import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DATABASE_URL;
if (!uri) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const config = [
    {
        "collection": "File",
        "field": "expiresAt",
        "expireAfterSeconds": 0
    },
    {
        "collection": "Share",
        "field": "endDate",
        "expireAfterSeconds": 0
    }
]

async function createTTLIndexes() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const dbName = uri.split("/").pop().split("?")[0];
        const db = client.db(dbName);

        for (const { collection, field, expireAfterSeconds } of config) {
            console.log(`Checking indexes on ${collection}.${field}...`);

            const coll = db.collection(collection);
            const indexes = await coll.indexes();

            const existing = indexes.find(
                idx =>
                    idx.key[field] === 1 &&
                    Object.prototype.hasOwnProperty.call(idx, "expireAfterSeconds")
            );

            if (existing) {
                if (existing.expireAfterSeconds === expireAfterSeconds) {
                    console.log(
                        `Index already exists on ${collection}.${field}`
                    );
                    continue;
                } else {
                    console.log(
                        `Updating TTL index on ${collection}.${field} (old=${existing.expireAfterSeconds}, new=${expireAfterSeconds})`
                    );
                    await coll.dropIndex(existing.name);
                }
            }

            await coll.createIndex({ [field]: 1 }, { expireAfterSeconds });
            console.log(
                `TTL index created on ${collection}.${field}`
            );
        }
    } catch (err) {
        console.error("Error creating TTL indexes:", err);
    } finally {
        await client.close();
    }
}

createTTLIndexes();
