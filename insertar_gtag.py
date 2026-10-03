"""
Inserta (o corrige) el snippet de Google Analytics en todos los .html del
proyecto, con chequeo de entorno local para no contar visitas de desarrollo.

Uso: guardalo en la raiz del proyecto y ejecuta:  python insertar_gtag.py

- Si el archivo no tiene GA: lo agrega justo despues de <head>.
- Si tiene el snippet simple (sin chequeo de local): lo reemplaza.
- Si ya tiene la version con chequeo: no lo toca.
- Si tiene el ID en otro formato: lo lista para revisar a mano.

Revisa los cambios con 'git diff' antes de hacer commit.
"""

import os
import re

GA_ID = "G-3Y2W337NNG"

SNIPPET = f"""<!-- Google tag (gtag.js) -->
<script>
    (function () {{
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {{ dataLayer.push(arguments); }};

        var h = location.hostname;
        var esLocal =
            location.protocol === 'file:' ||
            h === '' || h === 'localhost' || h === '127.0.0.1' || h === '[::1]' ||
            /^(192\\.168\\.|10\\.|172\\.(1[6-9]|2\\d|3[01])\\.)/.test(h) ||
            h.endsWith('.local');

        if (esLocal) return;

        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id={GA_ID}';
        document.head.appendChild(s);

        gtag('js', new Date());
        gtag('config', '{GA_ID}');
    }})();
</script>
"""

# Snippet simple que insertaba la version anterior del script
PATRON_SIMPLE = re.compile(
    r"<!--\s*Google tag \(gtag\.js\)\s*-->\s*"
    r"<script[^>]*googletagmanager\.com/gtag/js\?id=" + re.escape(GA_ID) + r"[^>]*></script>\s*"
    r"<script>.*?gtag\('config',\s*'" + re.escape(GA_ID) + r"'\);?\s*</script>\s*",
    re.DOTALL,
)

PATRON_HEAD = re.compile(r"<head[^>]*>", re.IGNORECASE)

CARPETA_RAIZ = os.path.dirname(os.path.abspath(__file__))


def procesar(ruta):
    with open(ruta, "r", encoding="utf-8") as f:
        contenido = f.read()

    if "esLocal" in contenido and GA_ID in contenido:
        return "ok"

    if GA_ID in contenido:
        nuevo, n = PATRON_SIMPLE.subn(lambda m: SNIPPET, contenido, count=1)
        if n == 0:
            return "revisar"
        accion = "reemplazado"
    else:
        m = PATRON_HEAD.search(contenido)
        if not m:
            return "sin_head"
        pos = m.end()
        nuevo = contenido[:pos] + "\n" + SNIPPET + contenido[pos:]
        accion = "agregado"

    with open(ruta, "w", encoding="utf-8") as f:
        f.write(nuevo)
    return accion


def main():
    res = {"agregado": [], "reemplazado": [], "ok": [], "revisar": [], "sin_head": []}

    for carpeta, dirs, archivos in os.walk(CARPETA_RAIZ):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules")]
        for nombre in archivos:
            if nombre.lower().endswith(".html"):
                ruta = os.path.join(carpeta, nombre)
                res[procesar(ruta)].append(os.path.relpath(ruta, CARPETA_RAIZ))

    titulos = {
        "agregado": "Snippet agregado",
        "reemplazado": "Snippet simple reemplazado por el que chequea local",
        "ok": "Ya estaban correctos",
        "revisar": "REVISAR A MANO (tienen el ID en otro formato)",
        "sin_head": "Salteados (no se encontro <head>)",
    }
    print("\n=== RESUMEN ===")
    for clave, titulo in titulos.items():
        if res[clave]:
            print(f"\n{titulo}: {len(res[clave])}")
            for r in res[clave]:
                print(f"  - {r}")

    print("\nListo. Revisa los cambios con 'git diff' antes de hacer commit.")


if __name__ == "__main__":
    main()
