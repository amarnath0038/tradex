import { db } from "@repo/db"

export const testDb = async () => {
    try {
        const result = await Promise.race([
            db.query.users.findFirst(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")),3000))
        ])
        console.log("DB Connected");
    } catch (err) {
        console.log("DB FAILED", err);
    }
}