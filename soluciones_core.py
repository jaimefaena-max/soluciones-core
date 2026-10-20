import os

class SolucionesAIClient:
    def __init__(self, model="gpt2"):
        self.model = model
        self.api_key = os.getenv("HF_API_KEY")
        if not self.api_key:
            raise ValueError("Error crítico: HF_API_KEY no configurada.")
        print(f"Cliente maestro inicializado para el modelo: {self.model} con seguridad Zero Trust.")

    def generate(self, prompt):
        return f"[Producción Local] Inferencia simulada segura para: '{prompt}'"

if __name__ == "__main__":
    ai = SolucionesAIClient()
    print(ai.generate("Prueba del sistema central"))