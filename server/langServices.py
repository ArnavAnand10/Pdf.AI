from langchain_google_vertexai import ChatVertexAI, VertexAIEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_core.messages import HumanMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain import hub
from langgraph.graph import START, StateGraph
from pydantic import BaseModel, Field
from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
from typing_extensions import List, TypedDict
from IPython.display import Image, display
import os
import pandas as pd
from Database.connection import connectDB
from langchain_core.prompts import PromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()





pc = Pinecone(api_key=os.getenv("PINECONE_KEY"))
index_name = "multi-tenant-agent"
index = pc.Index(index_name)
llm = ChatVertexAI(model="gemini-1.5-flash")


class State(TypedDict):
    question: str
    context: List[Document]
    answer: str  
    namespace:str
    

def extract_text_from_pdf(pdf_path:str):
    # Initialize the PDF loader
    loader = PyPDFLoader(pdf_path)
    
    # Extract text from all pages
    text = loader.load()
    
    
    return text



def splitIntoDocs(docs:list):
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # chunk size (characters)
        chunk_overlap=200,  # chunk overlap (characters)
        add_start_index=True,  # track index in original document
    )
    all_splits = text_splitter.split_documents(docs)
    print(f"Split blog post into {len(all_splits)} sub-documents.")
    return all_splits


def generateEmbeddings(text:str):
    embeddings_model = VertexAIEmbeddings(model_name="text-embedding-004")
    return embeddings_model.embed_query(text)

def store_embeddings(vectors, namespace:str):
    
    # Use the namespace for multi-tenancy
    index.upsert(
        vectors=vectors,
        namespace=namespace  # Specify the namespace here
    )

def handle_uploaded_pdf(pdf_path: str, user_type: str, user_id: str):
    """ Handle the uploaded PDF file, extract text, and store embeddings in Pinecone. """
    
    docs = extract_text_from_pdf(pdf_path)
    splits = splitIntoDocs(docs)
    embeddings = []
    for doc in splits:
        print(doc.page_content)
        embedding = generateEmbeddings(doc.page_content)
        embeddings.append(embedding)

    namespace = f"{user_type}_{user_id}"
    vectors = []
    for i, embed in enumerate(embeddings):
        print(embed)
        metadata = {'id': f"{i}", 'text': splits[i].page_content}  # Metadata can include document info
        dict = {
            "id": f"{i}", 
            "values": embed, 
            "metadata": metadata
            }
        vectors.append(dict)
    store_embeddings(vectors,namespace)
    print("Successfully stored embeddings")

def retrieve(state:State):
   
    res = index.query(
        namespace=state["namespace"],
        include_metadata = True,
        top_k=2,
        vector = generateEmbeddings(state["question"])
    )
    return {"context": res["matches"]}

def generate(state: State):
    prompt = hub.pull("rlm/rag-prompt")
    docs_content = "\n\n".join(doc["metadata"]["text"] for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}

def answerQuery(question:str,userType:str,userId:str):
    db = connectDB()
    users_collection = db.get_collection("users")
    

    user = users_collection.find_one({"email": userId, "userType": userType})
    # print(type(user), user['chat_history'])
    print("chat history retrieved")
    history = user["chat_history"]
    query = query_analysis(question,history)


    namespace = f"{userType}_{userId}"
    graph_builder = StateGraph(State).add_sequence([retrieve, generate])
    graph_builder.add_edge(START, "retrieve")
    graph = graph_builder.compile()

    result = graph.invoke({"question": query,"namespace":namespace})["answer"]
    # before actaully returning we will save chat history in mongoDB
    try:
        users_collection = db.get_collection("users")
        user = users_collection.find_one({"email": userId, "userType": userType})
        chat_entry = {
            "question": question,
            "answer": result
        }

        users_collection.update_one(
            {"email": userId, "userType": userType},  # Find user by email and userType
            {"$push": {"chat_history": chat_entry}}  # Push the new question-answer pair to chat_history
        )
    except Exception as e:
        print(f"Error storing conversation in DB: {e}")

    return result


def namespace_exists(namespace: str) -> bool:
    """Check if a given namespace exists in the Pinecone index."""
    try:
        stats = index.describe_index_stats()
        existing_namespaces = stats.get("namespaces", {}).keys()
        return namespace in existing_namespaces
    except Exception as e:
        print(f"Error checking namespace: {e}")
        return False
    
def query_analysis(query: str, chat_history: str) -> str:
    """Analyzes and refines a user query if it contains ambiguous pronouns, otherwise returns it unchanged."""

    query_refinement_prompt = PromptTemplate.from_template(
        """You are an AI assistant that refines user queries only when necessary.  
        Given a user query and relevant chat history, your task is to analyze the query  
        and determine if it requires clarification.  

        **Refinement Criteria:**  
        - If the query contains pronouns (e.g., "this," "that," "it," "they," "those," "these," "he," "she," "we")  
          or other ambiguous references, reconstruct it using the provided chat history  
          to make it self-contained and contextually complete.  
        - If the query is already well-formed and does not contain ambiguous pronouns  
          or does not need previous context, return it unchanged.  

        **Chat History:**  
        {chat_history}  

        **User Query:**  
        {query}  

        **Refined Query:**"""
    )

    # Load the LLM model
    llm = ChatVertexAI(model="gemini-1.5-flash")

    # Generate refined query
    prompt_text = query_refinement_prompt.format(chat_history=chat_history, query=query)
    response = llm.invoke(prompt_text)

    return response.content.strip()
