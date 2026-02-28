import os
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from dotenv import load_dotenv

load_dotenv()

# 1. Setup ChromaDB
client = chromadb.PersistentClient(path="./rag_db")

# 2. UPDATED: Using the modern gemini-embedding-001 ID
google_ef = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
    api_key=os.getenv("GEMINI_API_KEY"),
    model_name="models/gemini-embedding-001"
)

collection = client.get_or_create_collection(name="tathastu_knowledge_base", embedding_function=google_ef)

documents = [
    "DIET RULE 1 (Vegetarian): Focus on Paneer (200g) and Soya Chunks (50g). Suggest Indian Dal and Rice.",
    "DIET RULE 2 (Weight Loss): 500-calorie deficit. Intermittent Fasting. No sugar in Chai.",
    "WORKOUT RULE 1 (Beginners): 3-day Full Body routine. Focus on form.",
    "WORKOUT RULE 2 (Advanced): 6-day PPL (Push/Pull/Legs) split with 8-12 reps."
]

ids = [f"doc_{i}" for i in range(len(documents))]

print("Refreshing Knowledge Base with Gemini-Embedding-001...")
collection.upsert(documents=documents, ids=ids)
print("✅ Seeded successfully!")