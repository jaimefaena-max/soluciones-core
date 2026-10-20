import os

api_key = os.getenv('HF_API_KEY')
print('Estado de la llave local:')
if api_key:
    print('Llave detectada exitosamente en la sesion. Longitud:', len(api_key))
else:
    print('Error: No se encontro la llave HF_API_KEY en la sesion.')
