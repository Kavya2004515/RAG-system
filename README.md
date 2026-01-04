# RAG-system

Week 1 – Knowledge Ingestion Layer
“In the first week, I focused on building the knowledge ingestion layer of the RAG system.”
The main objective here was to take raw documents and convert them into a format that the AI can understand and search efficiently.
I implemented a file upload service that allows users to upload PDF documents securely. Once the document is uploaded, the system automatically parses the PDF and extracts the text content.
The extracted text is then split into 1000-character overlapping chunks. Overlapping is important because it ensures that no important context is lost between chunks.
After chunking, I generated vector embeddings for each chunk using an embedding model. These embeddings capture the semantic meaning of the text rather than just keywords.
All generated vectors are stored in MongoDB Atlas with Vector Search enabled, which allows fast and accurate semantic retrieval.
At the end of Week 1, I verified that:
Vectors are successfully indexed
Documents are searchable
Relevant content can be retrieved correctly from the database
This week laid the foundation of the entire RAG system.  



Week 2 – Retrieval Engine Core
“In the second week, I worked on the retrieval engine, which is the core intelligence of the RAG system.”
When a user asks a question, the system converts that query into a vector and performs a semantic search using MongoDB’s Vector Search operator.
I implemented a MongoDB aggregation pipeline to retrieve the top 3 most relevant chunks from the stored documents.
These retrieved chunks are then combined with the user’s query and passed into a structured system prompt. This prompt is carefully designed so that the language model answers only based on the retrieved content.
LangChain logic is used to manage this flow and ensure that:
The model does not use its own general knowledge
It relies strictly on document context
The success criteria for this week was tested by querying something like “Refund Policy” and ensuring that:
Only the relevant paragraph is retrieved
The model uses that content before generating a response
This week ensured accuracy and relevance in responses.



Week 3 – Chat Interface & Synthesis
“In the third week, I focused on how users interact with the system and how responses are generated.”
I integrated Gemini 1.5 Flash as the language model to achieve low-latency and fast responses.
To improve user experience, I implemented response streaming using Server-Sent Events (SSE). This allows answers to appear in real time instead of waiting for the full response.
The backend streams tokens as they are generated, and the React frontend displays them instantly.
I also added reference cards in the UI, so users can see which document sections were used to generate the answer. This increases transparency and trust.
A critical part of this week was hallucination testing.
I intentionally asked questions that were not present in the uploaded SOP documents.
The expected behavior was:
The AI must refuse to answer
Or clearly state that it lacks sufficient context
The system behaved correctly, proving that hallucinations are effectively controlled.



Week 4 – Optimization & Deployment
“In the final week, I focused on optimization, persistence, and deployment.”
I implemented chat history storage in MongoDB, which allows the system to remember previous interactions and support contextual follow-up questions.
Security features were finalized, including role-based access control, ensuring only authorized users can access sensitive data.
The entire application—frontend, backend, and database—was then deployed to Vercel/Render, making it production-ready.
Finally, I conducted end-to-end User Acceptance Testing (UAT) with non-technical users to validate:
Ease of use
Response accuracy
System reliability



Flow Summary
“Let me summarize the complete flow.”
User uploads documents
Documents are chunked & embedded
Vectors stored in MongoDB
User asks a question
Relevant chunks retrieved
Context passed to LLM
Answer generated only from retrieved data


Key Advantages of This RAG System
✅ No hallucinations
✅ Scalable architecture
✅ Secure & role-based
✅ Real-time streaming
✅ Enterprise-ready design
This system is suitable for:
SOP chatbots
Internal knowledge bases
Enterprise document assistants



Closing Statement
“This RAG system ensures accurate, explainable, and trustworthy AI responses by combining vector search, controlled prompting, and real-time generation.”
Thank you. I’m happy to explain any module in detail.