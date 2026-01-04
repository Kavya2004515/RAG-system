import os
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = quote_plus(os.getenv("MONGO_PASSWORD"))
MONGO_CLUSTER = os.getenv("MONGO_CLUSTER")
MONGO_DB = os.getenv("MONGO_DB")

MONGO_URI = (
    f"mongodb+srv://{MONGO_USER}:{MONGO_PASSWORD}"
    f"@{MONGO_CLUSTER}/{MONGO_DB}?retryWrites=true&w=majority"
)

client = MongoClient(MONGO_URI)
collection = client[MONGO_DB]["documents"]

print("✅ Connected to MongoDB")

model = SentenceTransformer("all-MiniLM-L6-v2")

query = input("Ask a question: ")
query_embedding = model.encode(query).tolist()

pipeline = [
    {
        "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": query_embedding,
            "numCandidates": 100,
            "limit": 3
        }
    },
    {
        "$project": {
            "_id": 0,
            "chunk_id": 1,
            "text": 1,
            "score": { "$meta": "vectorSearchScore" }
        }
    }
]

results = list(collection.aggregate(pipeline))

print("\n📚 Top Retrieved Chunks:\n")
for r in results:
    print(f"Chunk {r['chunk_id']} | Score: {r['score']:.4f}")
    print(r["text"][:500])
    print("-" * 60)
