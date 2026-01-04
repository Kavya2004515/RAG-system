/**************************************************
 * Week 3 – STRICT MongoDB Vector RAG (100% FREE)
 * Embeddings: MiniLM (384 dims, LOCAL)
 * LLM: ❌ NONE (Document-grounded RAG)
 **************************************************/

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { pipeline } = require("@xenova/transformers");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = 4000;

// =====================
// MONGODB CONFIG
// =====================
const MONGO_URI =
  "mongodb+srv://23nu5a0405_db_user:Kavya%40214@cluster0.acs89sg.mongodb.net/rag_db?retryWrites=true&w=majority";

const DB_NAME = "rag_db";
const COLLECTION = "documents";
const VECTOR_INDEX = "vector_index";

let collection;

// =====================
// CONNECT MONGODB
// =====================
MongoClient.connect(MONGO_URI)
  .then(client => {
    collection = client.db(DB_NAME).collection(COLLECTION);
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// =====================
// LOAD LOCAL EMBEDDING MODEL (384 DIM)
// =====================
let embedder;

(async () => {
  embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  console.log("✅ MiniLM loaded (384 dims)");
})();

// =====================
// EMBED QUERY
// =====================
async function embedQuery(text) {
  const output = await embedder(text, {
    pooling: "mean",
    normalize: true
  });
  return Array.from(output.data); // 384 dims
}
const history = await chatCollection
  .find({ sessionId })
  .sort({ timestamp: -1 })
  .limit(3)
  .toArray();
let finalQuery = q;

if (history.length > 0) {
  finalQuery =
    history.map(h => h.question).join(" ") + " " + q;
}


// =====================
// VECTOR SEARCH
// =====================
async function retrieveChunks(vector) {
  return await collection.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX,
        path: "embedding",
        queryVector: vector,
        numCandidates: 100,
        limit: 3
      }
    },
    {
      $project: {
        _id: 0,
        text: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]).toArray();
}

// =====================
// CHAT ENDPOINT (STRICT RAG)
// =====================
app.get("/chat/stream", async (req, res) => {
  const q = req.query.q;
  const sessionId = req.query.sessionId || "default";
  if (!q) return res.end();

  try {
    // 1️⃣ Embed query
    const vector = await embedQuery(finalQuery);

    // 2️⃣ Retrieve top chunks
    const chunks = await retrieveChunks(vector);

    // 3️⃣ No results → refuse
    if (!chunks.length) {
      return res.send(
        "I don't have enough information in the provided documents to answer this question."
      );
    }

    // 4️⃣ Similarity threshold (STRICT)
    const TOP_SCORE = chunks[0].score;
    const THRESHOLD = 0.75;

    console.log("🔢 Top similarity score:", TOP_SCORE.toFixed(4));

    if (TOP_SCORE < THRESHOLD) {
      return res.send(
        "I don't have enough information in the provided documents to answer this question."
      );
    }

    // 5️⃣ Return grounded context only
    res.send(chunks.map(c => c.text).join("\n\n"));

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.send(
      "I don't have enough information in the provided documents to answer this question."
    );
  }
});

// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
