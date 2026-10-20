import os

class MockInferenceClient:
    def __init__(self, model="gpt2", token=None):
        self.model = model
        self.token = token
        print(f"Mock Client inicializado para el modelo: {self.model}")

    def text_generation(self, prompt, max_new_tokens=20):
        return f"[Modo Local Mock] Respuesta generada exitosamente para: '{prompt}'"

client = MockInferenceClient(model="gpt2", token=os.getenv("HF_API_KEY"))
response = client.text_generation("Hello from Soluciones con IA")
print(response)