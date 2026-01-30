# !pip install langchain_community
# !pip install langchain_openai
# !pip install langchain_huggingface
# !pip install faiss-cpu

import os
import re
import time
import logging
from typing import List, Tuple
from dotenv import load_dotenv
from openai import OpenAI
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("rag_bncc")

EMBED_MODEL_NAME = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-large")
embedding_model = OpenAIEmbeddings(model=EMBED_MODEL_NAME, api_key=os.getenv("OPENAI_API_KEY"))

def buscar_com_filtro(tema, ano_alvo=None, etapa_alvo=None, componente_alvo=None, k: int = 3, fetch_k: int = 50) -> Tuple[List, List[float]]:
    #colocar o diretório do faiss
    index_path = "src/infra/services/rag/faiss_bncc_index"
    start = time.perf_counter()
    logger.info(f"Iniciando carregamento do índice FAISS em {index_path} usando embeddings {EMBED_MODEL_NAME}")
    try:
        db = FAISS.load_local(index_path, embedding_model, allow_dangerous_deserialization=True)
    except Exception as e:
        logger.error(f"Falha ao carregar índice FAISS: {e}")
        raise

    # Criar o filtro baseado nos metadados
    filtro = {}
    if ano_alvo:
        filtro["ano"] = ano_alvo
    if etapa_alvo:
        filtro["etapa"] = etapa_alvo
    if componente_alvo:
        filtro["componente"] = componente_alvo

    logger.info(f"Consultando índice: tema='{tema}', k={k}, fetch_k={fetch_k}, filtro={filtro}")
    try:
        docs_and_scores = db.similarity_search_with_score(
            tema,
            k=k,
            filter=filtro,
            fetch_k=fetch_k,
        )
    except Exception as e:
        logger.error(f"Erro na busca de similaridade: {e}")
        raise

    docs = [doc for doc, _ in docs_and_scores]
    scores = [float(score) for _, score in docs_and_scores]
    elapsed = (time.perf_counter() - start) * 1000
    logger.info(f"Recuperados {len(docs)} documentos em {elapsed:.1f} ms")
    for i, (doc, score) in enumerate(docs_and_scores, 1):
        logger.info(f"[{i}] score={score:.4f} codigo={doc.metadata.get('codigo')} ano={doc.metadata.get('ano')} etapa={doc.metadata.get('etapa')} componente={doc.metadata.get('componente')}")

    return docs, scores


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def _extract_bncc_codes(text: str) -> List[str]:
    pattern = r"\b(?:EF|EI)\d{2}[A-Z]{2}\d{2}\b"
    return re.findall(pattern, text)


def generate_lesson_plan(question, relevant_documents, model=None):
    if model is None:
        model = os.getenv("OPENAI_CHAT_MODEL") or "gpt-4o-mini"
    if not relevant_documents:
        logger.warning("Nenhum documento relevante encontrado; retornando mensagem padrão.")
        return "Não encontrado no contexto."

    context_parts = []
    for doc in relevant_documents:
        codigo = doc.metadata.get('codigo', 'N/A')
        context_parts.append(f"CÓDIGO: {codigo}\nDESCRIÇÃO: {doc.page_content}")

    context = "\n\n".join(context_parts)

    prompt = f"""
    Você é um assistente acadêmico especializado na BNCC.
    Crie um plano de aula detalhado seguindo as diretrizes abaixo.

    CONTEXTO (Habilidades extraídas do dataset):
    {context}

    SOLICITAÇÃO DO PROFESSOR:
    {question}

    REGRAS:
    1. Se as habilidades acima não forem relevantes para o tema, responda: "Não encontrado no contexto."
    2. Use EXCLUSIVAMENTE as habilidades fornecidas no contexto.
    3. Formate o plano com: Título, Códigos BNCC, Objetivos, Metodologia e Avaliação.
    """

    logger.info(f"Gerando plano com modelo {model}")
    start = time.perf_counter()
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "Você é um gerador de planos de aula rigoroso que segue a BNCC."},
            {"role": "user", "content": prompt}
        ]
    )
    elapsed = (time.perf_counter() - start) * 1000
    content = response.choices[0].message.content
    logger.info(f"Plano gerado em {elapsed:.1f} ms")

    produced_codes = set(_extract_bncc_codes(content))
    available_codes = {doc.metadata.get('codigo') for doc in relevant_documents if doc.metadata.get('codigo')}
    extras = produced_codes - available_codes
    if extras:
        logger.warning(f"Códigos na resposta não presentes no contexto: {sorted(extras)}")
    else:
        logger.info("Todos os códigos BNCC na resposta pertencem ao contexto recuperado.")

    return content

def main():
    pergunta = "Quero uma aula sobre rimas e sons para o 1º ano"
    docs_relevantes, scores = buscar_com_filtro(pergunta, "1º ano", "Ensino Fundamental", "Língua Portuguesa", k=3, fetch_k=50)
    plano_final = generate_lesson_plan(pergunta, docs_relevantes)
    print(plano_final)


if __name__ == "__main__":
    main()
