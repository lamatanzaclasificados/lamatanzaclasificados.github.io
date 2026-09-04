"""
Script para agregar el tag <script src="/js/whatsapp-track.js"></script>
a todos los archivos .html del sitio, justo antes de </body>.

CÓMO USARLO:

1. Primero asegurate de tener el archivo whatsapp-track.js dentro de tu
   carpeta /js/ (junto a script.js). Si no lo tenés ahí todavía, copialo
   antes de correr este script.

2. Guardá este archivo (insertar_whatsapp_track.py) en la carpeta raíz de
   tu proyecto, la misma donde está index.html y la carpeta /comercio/
   (donde ya guardaste insertar_gtag.py antes).

3. Abrí una terminal en esa carpeta y ejecutá:
       py insertar_whatsapp_track.py

4. El script recorre todos los .html (incluyendo /comercio/) e inserta
   el tag justo antes de </body> — salvo que ya lo tenga (no duplica).

5. Revisá los cambios con 'git diff' antes de hacer commit y push, igual
   que la vez pasada.
"""

import os

# Ruta del script tal como debe quedar en cada página.
# Usamos ruta absoluta ("/js/...") para que funcione igual sin importar
# si la página está en la raíz o dentro de /comercio/.
TAG = '<script src="/js/whatsapp-track.js"></script>'

CARPETA_RAIZ = os.path.dirname(os.path.abspath(__file__))


def procesar_archivo(ruta):
    with open(ruta, "r", encoding="utf-8") as f:
        contenido = f.read()

    if TAG in contenido:
        return "ya tenía el tag"

    contenido_lower = contenido.lower()
    idx = contenido_lower.rfind("</body>")

    if idx == -1:
        return "no se encontró </body>, se salteó"

    nuevo_contenido = (
        contenido[:idx]
        + TAG
        + "\n"
        + contenido[idx:]
    )

    with open(ruta, "w", encoding="utf-8") as f:
        f.write(nuevo_contenido)

    return "tag agregado"


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

                if resultado == "tag agregado":
                    modificados.append(ruta_relativa)
                elif resultado == "ya tenía el tag":
                    ya_tenian.append(ruta_relativa)
                else:
                    salteados.append(ruta_relativa)

    print("\n=== RESUMEN ===")
    print(f"Archivos modificados: {len(modificados)}")
    for r in modificados:
        print(f"  + {r}")

    if ya_tenian:
        print(f"\nArchivos que ya tenían el tag: {len(ya_tenian)}")
        for r in ya_tenian:
            print(f"  = {r}")

    if salteados:
        print(f"\nArchivos salteados (no se encontró </body>): {len(salteados)}")
        for r in salteados:
            print(f"  ! {r}")

    print("\nListo. Revisá los cambios con 'git diff' antes de hacer commit y push.")


if __name__ == "__main__":
    main()
