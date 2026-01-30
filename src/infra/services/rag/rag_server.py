from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging
load_dotenv()

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag")
app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

class GenerateRequest(BaseModel):
  prompt: str
  includeAssessment: Optional[bool] = False
  includeSlides: Optional[bool] = False
  ano: Optional[str] = None
  etapa: Optional[str] = None
  componente: Optional[str] = None

def _load_index():
  try:
    from langchain_community.vectorstores import FAISS
    from langchain_openai import OpenAIEmbeddings
    embedding = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))
    path = "src/infra/services/rag/faiss_bncc_index"
    db = FAISS.load_local(path, embedding, allow_dangerous_deserialization=True)
    logger.info({"event": "rag_db_loaded", "path": path})
    return db
  except Exception as e:
    logger.error({"event": "rag_db_load_failed", "error": str(e)})
    return None

_db = _load_index()

def _retrieve(prompt: str, filters: Dict[str, Any]) -> List[str]:
  if _db is None:
    logger.warning({"event": "rag_retrieve_skipped", "reason": "db_unavailable"})
    return []
  try:
    top_k = int(os.getenv("RAG_TOP_K") or "5")
  except Exception:
    top_k = 5
  applied_filter = {k: v for k, v in filters.items() if v}
  docs = []
  fallback_used = False
  try:
    docs = _db.similarity_search(prompt, k=top_k, filter=applied_filter)
  except Exception as e:
    logger.error({"event": "rag_similarity_failed", "error": str(e)})
  if not docs:
    try:
      docs = _db.similarity_search(prompt, k=top_k)
      fallback_used = True
      logger.info({"event": "rag_fallback_no_filter", "top_k": top_k})
    except Exception as e:
      logger.error({"event": "rag_fallback_failed", "error": str(e)})
  logger.info({
    "event": "rag_retrieve_done",
    "prompt_len": len(prompt or ""),
    "filters": applied_filter,
    "retrieved": len(docs),
    "fallbackUsed": fallback_used,
  })
  return [d.page_content for d in docs]

def _build_prompt(user_prompt: str, context: List[str], include_assessment: bool, include_slides: bool) -> str:
  parts = []
  parts.append("Você é um assistente acadêmico especializado na BNCC.")
  if context:
    parts.append("Contexto:")
    parts.append("\n\n".join(context))
  parts.append("Solicitação:")
  parts.append(user_prompt)
  extras = []
  if include_assessment:
    extras.append("incluir atividade avaliativa detalhada com critérios")
  if include_slides:
    extras.append("incluir estrutura de slides com títulos e bullets")
  if extras:
    parts.append("Instruções adicionais: " + "; ".join(extras))
  return "\n\n".join(parts)

def _generate_text(full_prompt: str) -> str:
  try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("OPENAI_CHAT_MODEL") or "gpt-4o-mini"
    resp = client.chat.completions.create(
      model=model,
      messages=[
        {"role": "system", "content": "Gerador de planos alinhados à BNCC."},
        {"role": "user", "content": full_prompt},
      ],
    )
    text = resp.choices[0].message.content
    logger.info({"event": "rag_llm_ok", "model": model, "response_len": len(text or "")})
    return text
  except Exception as e:
    logger.error({"event": "rag_llm_failed", "error": str(e)})
    return full_prompt

@app.post("/rag/generate")
def generate(req: GenerateRequest):
  filters = {"ano": req.ano, "etapa": req.etapa, "componente": req.componente}
  context = _retrieve(req.prompt, filters)
  full_prompt = _build_prompt(req.prompt, context, bool(req.includeAssessment), bool(req.includeSlides))
  text = _generate_text(full_prompt)
  logger.info(
    {
      "event": "rag_generate",
      "prompt_len": len(req.prompt or ""),
      "filters": filters,
      "context_len": len(context),
      "includeAssessment": bool(req.includeAssessment),
      "includeSlides": bool(req.includeSlides),
      "response_len": len(text or ""),
      "dbLoaded": _db is not None,
    }
  )
  return {
    "text": text,
    "usedFilters": {"includeAssessment": bool(req.includeAssessment), "includeSlides": bool(req.includeSlides)},
  }

@app.get("/rag/health")
def health():
  ok = _db is not None
  sample = 0
  if ok:
    try:
      res = _db.similarity_search("BNCC", k=1)
      sample = len(res or [])
    except Exception:
      sample = -1
  return {"dbLoaded": ok, "sampleRetrieveCount": sample}
