"""
Script para agregar el snippet de Google Analytics (gtag.js) a todos los
archivos .html de tu sitio, sin tener que pegarlo a mano en cada uno.

CÓMO USARLO (paso a paso):

1. Necesitás tener Python instalado. Si no lo tenés, descargalo de
   https://www.python.org/downloads/ (al instalar, marcá la casilla
   "Add Python to PATH").

2. Guardá este archivo (insertar_gtag.py) DENTRO de la carpeta raíz de tu
   proyecto (la misma carpeta donde está tu index.html y la carpeta /comercio/).

3. Abrí una terminal en esa carpeta:
   - En Windows: click derecho dentro de la carpeta > "Abrir en Terminal"
     (o Shift + click derecho > "Abrir ventana de PowerShell aquí")

4. Ejecutá:
       python insertar_gtag.py

5. El script va a recorrer TODOS los .html de la carpeta (incluyendo
   subcarpetas como /comercio/), y va a insertar el snippet justo después
   de la etiqueta <head> en cada uno — salvo que ya lo tenga (no duplica).

6. Al terminar te muestra un resumen: cuántos archivos modificó, cuántos
   ya lo tenían, y si hubo algún error.

7. Con git, revisá los cambios (git diff) antes de hacer commit y push,
   así confirmás que se vea bien antes de publicar.

IMPORTANTE: no borra nada, solo agrega el snippet. Aun así, si usás git,
podés revisar los cambios y revertir fácil si algo sale mal.
"""

import os

# ID de medición de Google Analytics (el tuyo, ya cargado abajo)
GA_ID = "G-3Y2W337NNG"

# El snippet que se va a insertar en cada página
SNIPPET = f"""<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{GA_ID}');
</script>
"""

# Carpeta donde está este script (asumimos que es la raíz del sitio)
CARPETA_RAIZ = os.path.dirname(os.path.abspath(__file__))


def procesar_archivo(ruta):
    """
    Lee un archivo .html, y si no tiene ya el snippet de GA, lo inserta
    justo después de <head>. Devuelve un texto indicando qué se hizo.
    """
    with open(ruta, "r", encoding="utf-8") as f:
        contenido = f.read()

    # Si ya tiene este ID de Google Analytics, no tocamos el archivo
    if GA_ID in contenido:
        return "ya tenía el snippet"

    # Buscamos la etiqueta <head> (sin importar mayúsculas/minúsculas)
    contenido_lower = contenido.lower()
    idx = contenido_lower.find("<head>")

    if idx == -1:
        # No encontramos <head> tal cual — no modificamos este archivo
        return "no se encontró <head>, se salteó"

    # La posición justo después de "<head>" (6 caracteres)
    posicion_insercion = idx + len("<head>")

    nuevo_contenido = (
        contenido[:posicion_insercion]
        + "\n"
        + SNIPPET
        + contenido[posicion_insercion:]
    )

    with open(ruta, "w", encoding="utf-8") as f:
        f.write(nuevo_contenido)

    return "snippet agregado"


def main():
    modificados = []
    ya_tenian = []
    salteados = []

    for carpeta_actual, _, archivos in os.walk(CARPETA_RAIZ):
        for nombre_archivo in archivos:
            if nombre_archivo.lower().endswith(".html"):
                ruta_completa = os.path.join(carpeta_actual, nombre_archivo)
                resultado = procesar_archivo(ruta_completa)
                ruta_relativa = os.path.relpath(ruta_completa, CARPETA_RAIZ)

                if resultado == "snippet agregado":
                    modificados.append(ruta_relativa)
                elif resultado == "ya tenía el snippet":
                    ya_tenian.append(ruta_relativa)
                else:
                    salteados.append(ruta_relativa)

    print("\n=== RESUMEN ===")
    print(f"Archivos modificados: {len(modificados)}")
    for r in modificados:
        print(f"  + {r}")

    if ya_tenian:
        print(f"\nArchivos que ya tenían el snippet: {len(ya_tenian)}")
        for r in ya_tenian:
            print(f"  = {r}")

    if salteados:
        print(f"\nArchivos salteados (no se encontró <head>): {len(salteados)}")
        for r in salteados:
            print(f"  ! {r}")

    print("\nListo. Revisá los cambios con 'git diff' antes de hacer commit y push.")


if __name__ == "__main__":
    main()
