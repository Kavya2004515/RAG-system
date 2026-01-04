import os
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
from dotenv import load_dotenv
from urllib.parse import quote_plus

# ---------------- LOAD ENV ----------------
load_dotenv()

MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = quote_plus(os.getenv("MONGO_PASSWORD"))
MONGO_CLUSTER = os.getenv("MONGO_CLUSTER")
MONGO_DB = os.getenv("MONGO_DB")

MONGO_URI = (
    f"mongodb+srv://{MONGO_USER}:{MONGO_PASSWORD}"
    f"@{MONGO_CLUSTER}/{MONGO_DB}?retryWrites=true&w=majority"
)

# ---------------- CONNECT ----------------
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db["documents"]

print("✅ Connected to MongoDB")

# 🔥 VERY IMPORTANT: CLEAR OLD DATA
collection.delete_many({})
print("🧹 Old documents cleared")

# ---------------- EMBEDDING MODEL ----------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# ---------------- TEXT SPLITTER ----------------
def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if len(chunk) >= 50:  # skip noise
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# ---------------- LOAD PDF ----------------
PDF_DIR = "data/docs"

for filename in os.listdir(PDF_DIR):
    if not filename.endswith(".pdf"):
        continue

    path = os.path.join(PDF_DIR, filename)
    reader = PdfReader(path)

    full_text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            full_text += page_text + "\n"

    chunks = chunk_text(full_text)

    print(f"📄 {filename} → {len(chunks)} chunks")

    for i, chunk in enumerate(chunks):
        embedding = model.encode(chunk).tolist()

        doc = {
            "text": chunk,
            "embedding": embedding,
            "source": filename,
            "chunk_id": i
        }

        collection.insert_one(doc)

        # DEBUG
        print(f"  ✔ Chunk {i}: {chunk[:80]}")

print("✅ Ingestion completed successfully!")
