"""
Script de Testes Automatizados no Terminal
Projeto: 01 — Chatbot de Suporte Full-Stack (AfesuTech)
Camada: Camada 2/3 — Validação & Qualidade de Software
Arquivo: backend/test_backend.py
"""

import sys
import time
from chatbot_engine import ChatbotEngine

# Configura codificação UTF-8 para exibição correta no terminal Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def run_tests():
    print("=" * 70)
    print("🤖 AFESUTECH - TESTES AUTOMATIZADOS DO MOTOR DO CHATBOT")
    print("=" * 70)

    # 1. Inicializa o motor do chatbot
    engine = ChatbotEngine()

    # Informações de status da LLM e ambiente
    llm_status = "Configurada (Groq API)" if engine.groq_api_key else "Modo Offline (RAG Local / Léxico)"
    model_name = engine.groq_model if engine.groq_api_key else "N/A"
    topicos_kb = len(engine.knowledge_base.get("topicos", []))

    print(f"📡 Status da LLM: {llm_status}")
    print(f"🧠 Modelo: {model_name}")
    print(f"📚 Tópicos na Base de Conhecimento: {topicos_kb}")
    print("=" * 70)

    # Cenários de teste a serem executados
    test_cases = [
        {
            "id": 1,
            "title": "Saudação do Usuário",
            "message": "Olá, tudo bem?",
            "expected_origins": ["saudacao", "llm_groq"],
            "min_confidence": 0.5
        },
        {
            "id": 2,
            "title": "Pergunta na Base de Conhecimento (Planos & Preços)",
            "message": "Quais são os planos e preços?",
            "expected_origins": ["base_conhecimento", "llm_groq"],
            "min_confidence": 0.5
        },
        {
            "id": 3,
            "title": "Pergunta sobre Integração (React & Python)",
            "message": "Como faço a integração com React e Python?",
            "expected_origins": ["base_conhecimento", "llm_groq"],
            "min_confidence": 0.5
        }
    ]

    passed_tests = 0
    total_tests = len(test_cases)

    for case in test_cases:
        print(f"\n▶ Teste {case['id']}: {case['title']}")
        print(f"  💬 Pergunta: \"{case['message']}\"")

        start_time = time.time()
        result = engine.process_message(case["message"])
        elapsed = time.time() - start_time

        reply = result.get("resposta", "")
        source = result.get("origem", "desconhecido")
        confidence = float(result.get("confianca", 0.0))

        print(f"  🔍 Origem da Resposta: {source}")
        print(f"  🎯 Nível de Confiança: {confidence:.2f} ({confidence * 100:.0f}%)")
        print(f"  ⏱️  Tempo de Resposta:  {elapsed:.3f}s")
        print("  📝 Resposta Obtida:")
        # Indenta a resposta para melhor leitura no terminal
        for line in reply.strip().split("\n"):
            print(f"     {line}")

        # Validações de teste
        has_reply = bool(reply and len(reply.strip()) > 10)
        valid_origin = source in case["expected_origins"] or source in ["base_conhecimento", "saudacao", "llm_groq"]
        valid_confidence = confidence >= case["min_confidence"] or source == "base_conhecimento"

        if has_reply and valid_origin and valid_confidence:
            print(f"  ✅ Status: [OK] - Teste {case['id']} passou!")
            passed_tests += 1
        else:
            print(f"  ❌ Status: [FALHA] - Teste {case['id']} não atendeu aos critérios.")

    print("\n" + "=" * 70)
    print("📊 RESUMO DA EXECUÇÃO DOS TESTES")
    print("=" * 70)
    print(f"Total de Testes: {total_tests}")
    print(f"Testes Aprovados: {passed_tests}")
    print(f"Testes Falhos: {total_tests - passed_tests}")

    # Exibe métricas consolidadas
    metrics = engine.get_metrics()
    print(f"Mensagens Processadas: {metrics.get('total_messages')}")
    print(f"Resolvidas por Base de Conhecimento: {metrics.get('resolved_by_knowledge_base')}")
    print(f"Resolvidas por Saudação: {metrics.get('resolved_by_greeting')}")
    print(f"Resolvidas por LLM: {metrics.get('resolved_by_llm')}")

    if passed_tests == total_tests:
        print("\n🎉 [OK] TODOS OS TESTES PASSARAM COM SUCESSO! O backend está pronto para o frontend.")
        print("=" * 70)
        return True
    else:
        print("\n⚠️ ALGUNS TESTES FALHARAM. Verifique as configurações antes de prosseguir.")
        print("=" * 70)
        return False


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
