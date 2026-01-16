"""
ProdPlan ONE - COPILOT Redaction Utilities
===========================================

Mascarar dados sensíveis (ex: nomes de funcionários para não-HR roles).
"""

import re
from typing import Dict, List, Any, Set


# Padrões para detetar nomes (simplificado - pode ser melhorado)
NAME_PATTERNS = [
    r"\b[A-Z][a-z]+ [A-Z][a-z]+\b",  # "João Silva"
    r"\b[A-Z]\. [A-Z][a-z]+\b",  # "J. Silva"
]


def mask_employee_names(text: str, employee_names: Set[str]) -> str:
    """
    Mascarar nomes de funcionários no texto.
    
    Substitui nomes por "Funcionário [ID]" ou similar.
    """
    masked = text
    for name in employee_names:
        # Escapar para regex
        escaped_name = re.escape(name)
        # Substituir por placeholder
        masked = re.sub(
            escaped_name,
            f"[Funcionário {hash(name) % 10000}]",
            masked,
            flags=re.IGNORECASE,
        )
    return masked


def redact_response(
    response: Dict[str, Any],
    employee_names: Set[str],
    has_hr_role: bool,
) -> Dict[str, Any]:
    """
    Redigir resposta do COPILOT se necessário.
    
    Se não tem HR role, mascarar nomes de funcionários no output.
    """
    if has_hr_role:
        return response  # Não redigir
    
    # Redigir summary
    if "summary" in response:
        response["summary"] = mask_employee_names(response["summary"], employee_names)
    
    # Redigir facts
    if "facts" in response:
        for fact in response.get("facts", []):
            if "text" in fact:
                fact["text"] = mask_employee_names(fact["text"], employee_names)
    
    # Citations mantêm IDs internos (não redigir)
    
    return response


def extract_employee_names_from_context(context: Dict[str, Any]) -> Set[str]:
    """Extrair nomes de funcionários do contexto para redação."""
    names = set()
    
    # Procurar em allocations
    allocations = context.get("operational_snapshot", {}).get("allocations", {})
    for emp in allocations.get("top_employees", []):
        if "name" in emp:
            names.add(emp["name"])
    
    return names


