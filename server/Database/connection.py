from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
def connectDB():
    mongo_url = os.getenv("DB_URI")
    client = MongoClient(mongo_url)
    db = client.get_database("Rag_Agent")
    return db