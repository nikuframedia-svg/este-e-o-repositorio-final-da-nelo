"""
ProdPlan ONE - COPILOT RAG Engine
==================================

RAG retrieval + embeddings para base de conhecimento.
"""

import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID, uuid4

from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.copilot.models import CopilotRAGChunk
from src.copilot.ollama_client import get_ollama_client
from src.shared.config import settings

logger = logging.getLogger(__name__)


def chunk_text(
    text: str,
    chunk_size: int = 600,
    overlap: int = 100,
) -> List[str]:
    """
    Chunking de texto.
    
    Args:
        text: Texto completo
        chunk_size: Tamanho do chunk (tokens aproximados)
        overlap: Overlap entre chunks (tokens)
    
    Returns:
        Lista de chunks
    """
    # Aproximação: 4 chars = 1 token
    char_size = chunk_size * 4
    char_overlap = overlap * 4
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + char_size
        chunk = text[start:end]
        
        # Tentar quebrar em frase/ponto final
        if end < len(text):
            last_period = chunk.rfind(".")
            last_newline = chunk.rfind("\n")
            break_point = max(last_period, last_newline)
            
            if break_point > char_size * 0.5:  # Se encontrou ponto razoável
                chunk = chunk[:break_point + 1]
                end = start + break_point + 1
        
        chunks.append(chunk.strip())
        start = end - char_overlap  # Overlap
    
    return chunks


async def get_embeddings(
    text: str,
    model: Optional[str] = None,
) -> List[float]:
    """
    Obter embeddings via Ollama.
    
    Args:
        text: Texto para embed
        model: Modelo de embeddings (default: settings.copilot_embeddings_model)
    
    Returns:
        Lista de floats (embedding vector)
    """
    model = model or settings.copilot_embeddings_model
    client = get_ollama_client()
    
    try:
        embedding = await client.embeddings(text, model)
        return embedding
    except Exception as e:
        logger.error(f"Erro ao obter embeddings: {e}")
        raise


async def retrieve_rag_chunks(
    session: AsyncSession,
    tenant_id: UUID,
    query: str,
    top_k: int = 8,
) -> List[Dict[str, Any]]:
    """
    Retrieval de chunks RAG.
    
    Se PostgreSQL: vector search com pgvector
    Se SQLite: busca lexical (LIKE + scoring simples)
    
    Args:
        session: Database session
        tenant_id: Tenant ID
        query: Query do utilizador
        top_k: Número de chunks a retornar
    
    Returns:
        Lista de chunks com score
    """
    # Obter embedding da query
    try:
        query_embedding = await get_embeddings(query)
    except Exception:
        logger.warning("Não foi possível obter embeddings - usando busca lexical")
        return await _lexical_search(session, tenant_id, query, top_k)
    
    # Verificar se é PostgreSQL (tem pgvector)
    db_url = str(session.bind.url) if hasattr(session, "bind") else ""
    is_postgres = "postgresql" in db_url.lower()
    
    if is_postgres:
        return await _vector_search(session, tenant_id, query_embedding, top_k)
    else:
        # SQLite: busca lexical
        return await _lexical_search(session, tenant_id, query, top_k)


async def _vector_search(
    session: AsyncSession,
    tenant_id: UUID,
    query_embedding: List[float],
    top_k: int,
) -> List[Dict[str, Any]]:
    """
    Vector search com pgvector (PostgreSQL).
    
    Nota: Requer extensão pgvector instalada.
    """
    # Converter embedding para formato pgvector
    embedding_str = "[" + ",".join(str(f) for f in query_embedding) + "]"
    
    # Query com cosine distance
    # Nota: Assumindo que embedding está em formato TEXT (JSON array)
    # Em produção, usar tipo VECTOR do pgvector
    query = select(CopilotRAGChunk).where(
        CopilotRAGChunk.tenant_id == tenant_id
    ).order_by(
        # Placeholder - em produção usar: func.cosine_distance(CopilotRAGChunk.embedding, query_embedding)
        CopilotRAGChunk.created_at.desc()
    ).limit(top_k)
    
    result = await session.execute(query)
    chunks = result.scalars().all()
    
    # Converter para dict com score placeholder
    return [
        {
            "id": str(chunk.id),
            "source_type": chunk.source_type,
            "source_id": chunk.source_id,
            "chunk_index": chunk.chunk_index,
            "chunk_text": chunk.chunk_text,
            "score": 0.85,  # Placeholder - calcular cosine similarity real
            "metadata": chunk.chunk_metadata or {},
        }
        for chunk in chunks
    ]


async def _lexical_search(
    session: AsyncSession,
    tenant_id: UUID,
    query: str,
    top_k: int,
) -> List[Dict[str, Any]]:
    """
    Busca lexical simples (SQLite ou fallback).
    
    Usa LIKE + scoring básico.
    """
    # Extrair palavras-chave da query
    keywords = re.findall(r"\w+", query.lower())
    
    if not keywords:
        return []
    
    # Query com LIKE
    conditions = []
    for keyword in keywords[:5]:  # Limitar a 5 keywords
        conditions.append(CopilotRAGChunk.chunk_text.ilike(f"%{keyword}%"))
    
    from sqlalchemy import or_
    query = select(CopilotRAGChunk).where(
        and_(
            CopilotRAGChunk.tenant_id == tenant_id,
            or_(*conditions),
        )
    ).limit(top_k * 2)  # Buscar mais para depois filtrar
    
    result = await session.execute(query)
    chunks = result.scalars().all()
    
    # Scoring simples: contar matches de keywords
    scored_chunks = []
    for chunk in chunks:
        text_lower = chunk.chunk_text.lower()
        matches = sum(1 for kw in keywords if kw in text_lower)
        score = matches / len(keywords) if keywords else 0.0
        
        scored_chunks.append({
            "id": str(chunk.id),
            "source_type": chunk.source_type,
            "source_id": chunk.source_id,
            "chunk_index": chunk.chunk_index,
            "chunk_text": chunk.chunk_text,
            "score": score,
            "metadata": chunk.chunk_metadata or {},
        })
    
    # Ordenar por score e retornar top_k
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]


async def ingest_document(
    session: AsyncSession,
    tenant_id: UUID,
    source_type: str,
    source_id: str,
    text: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> int:
    """
    Ingestão de documento para RAG.
    
    Args:
        session: Database session
        tenant_id: Tenant ID
        source_type: Tipo de fonte (ex: "sop", "doc", "policy")
        source_id: ID da fonte
        text: Texto completo
        metadata: Metadados (url, title, etc.)
    
    Returns:
        Número de chunks criados
    """
    # Chunking
    chunks = chunk_text(text, chunk_size=600, overlap=100)
    
    created_count = 0
    
    for idx, chunk_text_content in enumerate(chunks):
        # Obter embedding
        try:
            embedding = await get_embeddings(chunk_text_content)
            embedding_str = str(embedding)  # JSON array como string
        except Exception as e:
            logger.warning(f"Erro ao obter embedding para chunk {idx}: {e}")
            embedding_str = None
        
        # Criar chunk
        chunk = CopilotRAGChunk(
            tenant_id=tenant_id,
            source_type=source_type,
            source_id=source_id,
            chunk_index=idx,
            chunk_text=chunk_text_content,
            embedding=embedding_str,
            metadata=metadata,
        )
        
        session.add(chunk)
        created_count += 1
    
    await session.flush()
    
    logger.info(f"Ingestão concluída: {created_count} chunks criados para {source_type}:{source_id}")
    
    return created_count


