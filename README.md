# **Info.ai – RAG-Based AI Chatbot**  

Info.ai is an advanced **Retrieval-Augmented Generation (RAG) chatbot** leveraging **LangChain, LangGraph, and Google Vertex AI (Gemini-1.5)** to provide context-aware, document-driven responses. The system is designed for efficiency, modularity, and scalability, integrating advanced retrieval mechanisms with a robust multi-tenancy architecture.  

## **Key Features**  

- **RAG-Based AI Responses** – Enhances answer accuracy by retrieving relevant context before generation.  
- **Multi-Tenancy Support** – Utilizes **Pinecone namespaces** and **MongoDB** for isolated vector search and chat history storage.  
- **Query Refinement Module** – Implements **LangChain PromptTemplate** to improve ambiguous query resolution.  
- **Optimized Retrieval Pipeline** – Structured using **LangGraph** for modular and efficient execution.  
- **Scalable Document Ingestion** – Supports large datasets using **LangChain PyPDFLoader** and **RecursiveCharacterTextSplitter**.  
- **Real-Time AI Integration** – Seamlessly connects with a **React.js frontend** for interactive conversational experiences.  

## **Technology Stack**  

- **Backend**: Flask, Node.js, Express.js  
- **AI & NLP**: LangChain, LangGraph, Google Vertex AI (Gemini-1.5)  
- **Database**: Pinecone, MongoDB  
- **Frontend**: React.js  
- **Cloud & DevOps**: AWS, Docker  

## **Getting Started**  

### **Prerequisites**  
Ensure you have the following installed:  
- **Python 3.8+**  
- **Node.js 16+**  
- **MongoDB & Pinecone API Key**  
- **Google Vertex AI Access**  

### **Installation**  

1. **Clone the repository**  
   ```sh
   git clone https://github.com/YourUsername/Info.ai.git
   cd Info.ai
   ```

2. **Backend Setup**  
   ```sh
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**  
   ```sh
   cd frontend
   npm install
   npm start
   ```

## **Contributing**  

Contributions are welcome! Please open an issue or submit a pull request for improvements.  

## **License**  

This project is licensed under the **MIT License**.  
