// functions/index.js
// Firebase Cloud Function to calculate Realtime Database size.
// Runs every 24 hours and saves the result to /stats/dbSize.
//
// SETUP:
//   1. cd into your project root
//   2. firebase init functions  (choose JavaScript)
//   3. Replace functions/index.js with this file
//   4. cd functions && npm install
//   5. firebase deploy --only functions
//
// The frontend (storage.ts) will automatically pick up the value from /stats/dbSize.

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ─── Scheduled: every 24 hours ───────────────────────────────────────────────
exports.calculateDbSize = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async () => {
        const db = admin.database();

        // Read root – safe for small-to-medium DBs.
        // For very large DBs, consider scanning only key nodes and summing.
        const snapshot = await db.ref("/").once("value");
        const data = snapshot.val();

        if (!data) {
            await db.ref("/stats/dbSize").set({ bytes: 0, mb: "0.00", updatedAt: Date.now() });
            return null;
        }

        const bytes = Buffer.byteLength(JSON.stringify(data), "utf8");
        const mb = (bytes / (1024 * 1024)).toFixed(2);

        await db.ref("/stats/dbSize").set({ bytes, mb, updatedAt: Date.now() });

        console.log(`[calculateDbSize] ${mb} MB (${bytes} bytes) saved to /stats/dbSize`);
        return null;
    });

// ─── HTTP trigger (for manual refresh via browser / admin panel) ─────────────
exports.triggerDbSizeCalculation = functions.https.onRequest(async (req, res) => {
    // Simple secret check to prevent unauthorized access in production
    // Set FUNCTIONS_SECRET in Firebase Functions environment:
    //   firebase functions:secrets:set FUNCTIONS_SECRET
    // Or just remove this check if running in a trusted environment.
    const secret = req.query.secret || req.headers["x-secret"];
    const expected = functions.config().app?.secret || "procureflow-admin";
    if (secret !== expected) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }

    const db = admin.database();
    const snapshot = await db.ref("/").once("value");
    const data = snapshot.val();
    const bytes = data ? Buffer.byteLength(JSON.stringify(data), "utf8") : 0;
    const mb = (bytes / (1024 * 1024)).toFixed(2);

    await db.ref("/stats/dbSize").set({ bytes, mb, updatedAt: Date.now() });
    res.json({ bytes, mb, message: "Stats updated." });
});
