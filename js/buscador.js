document.addEventListener('DOMContentLoaded', () => {


    // ── Scroll hacia los resultados (o al cartel de "sin resultados") ──
    function irAResultados() {
        setTimeout(() => {
            const sin = document.getElementById('sin-resultados');
            const grid = document.querySelector('.portfolio-grid');
            const destino = (sin && sin.style.display !== 'none') ? sin : grid;
            if (!destino) return;

            // Si la barra superior es fija, descontar su alto
            const nav = document.querySelector('.navbar');
            const pos = nav ? getComputedStyle(nav).position : '';
            const offset = (pos === 'fixed' || pos === 'sticky') ? nav.offsetHeight : 0;

            const y = destino.getBoundingClientRect().top + window.pageYOffset - offset - 12;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }, 350);
    }


    /* */
    const input = document.getElementById('buscador');
    const chips = document.querySelectorAll('.zona-chip');
    if (!input) return;

    let zona = '';
    let timer;
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    function lanzar() {
        if (window.buscar) window.buscar(norm(input.value.trim()), zona);
    }

    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(lanzar, 150);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        clearTimeout(timer);
        lanzar();
        input.blur();        // cierra el teclado en el celular
        irAResultados();
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            zona = chip.dataset.zona;
            lanzar();
            irAResultados();   // <-- nuevo
        });
    });

    // Lo llama resetLoadMore cuando se elige un rubro
    window.limpiarBuscadorUI = () => {
        input.value = '';
        zona = '';
        chips.forEach((c, i) => c.classList.toggle('active', i === 0));
    };

    // ── Menú de categorías compacto (celular) ──
    const menu = document.querySelector('.portfolio-menu');
    const btnVer = document.getElementById('ver-todas');
    const fila = menu ? menu.querySelector('ul') : null;

    if (menu && btnVer && fila) {
        const TXT_ABRIR = 'Ver todas las categorías ▼';
        const TXT_CERRAR = 'Ver menos ▲';

        btnVer.addEventListener('click', () => {
            const abierto = menu.classList.toggle('expandido');
            btnVer.textContent = abierto ? TXT_CERRAR : TXT_ABRIR;
            btnVer.setAttribute('aria-expanded', abierto);
        });

        // Al elegir una categoría: plegar y centrar la elegida en la fila
        menu.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                setTimeout(() => {
                    menu.classList.remove('expandido');
                    btnVer.textContent = TXT_ABRIR;
                    btnVer.setAttribute('aria-expanded', 'false');
                    li.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
                }, 50);
            });
        });

        // Al buscar, la búsqueda pasa a "Todo": volver la fila al inicio
        const inputBusq = document.getElementById('buscador');
        if (inputBusq) {
            inputBusq.addEventListener('input', () => fila.scrollTo({ left: 0, behavior: 'smooth' }));
        }
        document.querySelectorAll('.zona-chip').forEach(c =>
            c.addEventListener('click', () => fila.scrollTo({ left: 0, behavior: 'smooth' }))
        );
    }



    // ── Pistas visuales de scroll horizontal en las zonas ──
    const wrapZonas = document.querySelector('.zonas-scroll');
    const filaZonas = wrapZonas ? wrapZonas.querySelector('.zonas') : null;
    const cajaBuscador = document.querySelector('.buscador');

    if (wrapZonas && filaZonas && cajaBuscador) {
        const fIzq = wrapZonas.querySelector('.zonas-flecha-izq');
        const fDer = wrapZonas.querySelector('.zonas-flecha-der');

        function actualizarZonas() {
            const max = filaZonas.scrollWidth - filaZonas.clientWidth;
            cajaBuscador.classList.toggle('hay-desborde', max > 8);
            wrapZonas.classList.toggle('fade-izq', filaZonas.scrollLeft > 8);
            wrapZonas.classList.toggle('fade-der', filaZonas.scrollLeft < max - 8);
        }

        filaZonas.addEventListener('scroll', () => {
            actualizarZonas();
            if (filaZonas.scrollLeft > 20) cajaBuscador.classList.add('hint-visto');
        }, { passive: true });

        window.addEventListener('resize', actualizarZonas);
        actualizarZonas();
        setTimeout(actualizarZonas, 400);
        window.addEventListener('load', actualizarZonas);

        // Flechas: avanzar o retroceder casi una pantalla
        fDer && fDer.addEventListener('click', () =>
            filaZonas.scrollBy({ left: filaZonas.clientWidth * 0.7, behavior: 'smooth' }));
        fIzq && fIzq.addEventListener('click', () =>
            filaZonas.scrollBy({ left: -filaZonas.clientWidth * 0.7, behavior: 'smooth' }));

        // Al elegir una zona, centrarla en la fila
        filaZonas.querySelectorAll('.zona-chip').forEach(chip =>
            chip.addEventListener('click', () => {
                chip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
            })
        );

        // Empujoncito automático la primera vez que se ve
        const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reducido && 'IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entradas) => {
                if (!entradas[0].isIntersecting) return;
                obs.disconnect();
                if (filaZonas.scrollLeft > 0) return;
                if (filaZonas.scrollWidth - filaZonas.clientWidth < 8) return;
                setTimeout(() => {
                    filaZonas.scrollTo({ left: 70, behavior: 'smooth' });
                    setTimeout(() => filaZonas.scrollTo({ left: 0, behavior: 'smooth' }), 650);
                }, 500);
            }, { threshold: 0.8 });
            obs.observe(filaZonas);
        }
    }


});

// ── Botón "Compartir por WhatsApp" en cada tarjeta ──
(function () {
    const DOMINIO = 'https://www.lamatanzaclasificados.com.ar';
    const SOLO_PAGOS = false; // true = solo muestra el botón en comercios con contacto activo

    const ICONO = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">' +
        '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>';

    document.addEventListener('DOMContentLoaded', () => {
        const grid = document.querySelector('.portfolio-grid');
        if (!grid) return;

        // Agregar el botón a cada tarjeta
        grid.querySelectorAll('.item').forEach(item => {
            const info = item.querySelector('.seo-info');
            if (!info || info.querySelector('.btn-compartir')) return;
            if (SOLO_PAGOS && !item.querySelector('a.popup-image')?.dataset.link) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-compartir';
            btn.innerHTML = ICONO + ' Compartir por WhatsApp';
            info.appendChild(btn);
        });

        // Un solo listener para todos los botones
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-compartir');
            if (!btn) return;

            const item = btn.closest('.item');
            const nombre = (item.querySelector('h3')?.textContent || 'Negocio')
                .replace(/\s+/g, ' ').trim();
            const enlace = item.querySelector('.link-comercio');
            const ruta = enlace ? enlace.getAttribute('href') : '/';
            const url = DOMINIO + ruta + '?utm_source=compartir&utm_medium=whatsapp';
            const texto = '¡Mirá este negocio de La Matanza! ' + nombre + '\n' + url;

            if (typeof window.gtag === 'function') {
                gtag('event', 'share', { method: 'WhatsApp', content_type: 'comercio', item_id: nombre });
            }

            window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
        });

        // Las tarjetas ahora son más altas: reacomodar el masonry
        setTimeout(() => {
            if (window.jQuery && jQuery(grid).data('isotope')) jQuery(grid).isotope('layout');
        }, 400);
    });
})();



// ── Compartir la imagen del popup ──
(function () {
    const DOMINIO = 'https://www.lamatanzaclasificados.com.ar';
    const ICONO = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">' +
        '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>';

    let cache = { src: null, file: null };

    // Convierte la imagen (webp/avif) a JPG, que WhatsApp acepta sin problemas
    function imagenComoArchivo(src, nombre) {
        return new Promise((ok, fail) => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.drawImage(img, 0, 0);
                const slug = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'negocio';
                c.toBlob(b => b ? ok(new File([b], slug + '.jpg', { type: 'image/jpeg' })) : fail(new Error('blob')),
                    'image/jpeg', 0.9);
            };
            img.onerror = fail;
            img.src = src;
        });
    }

    function datosActuales() {
        const item = jQuery.magnificPopup.instance.currItem;
        if (!item) return null;
        const card = jQuery(item.el).closest('.item')[0];
        const nombre = (card?.querySelector('h3')?.textContent || 'Negocio').replace(/\s+/g, ' ').trim();
        const ruta = card?.querySelector('.link-comercio')?.getAttribute('href') || '/';
        const url = DOMINIO + ruta + '?utm_source=compartir&utm_medium=popup';
        return { src: item.src, nombre, texto: '¡Mirá este negocio de La Matanza! ' + nombre + '\n' + url };
    }

    function iniciar() {
        if (!window.jQuery || !jQuery.magnificPopup) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'popup-compartir';
        btn.innerHTML = ICONO + ' Compartir';
        document.body.appendChild(btn);

        // Mostrar solo con el popup abierto y preparar la imagen de antemano
        // (el celular exige compartir justo después del toque, sin demoras)

        function posicionar() {
            const img = document.querySelector('.mfp-img');
            if (!img) return;
            const r = img.getBoundingClientRect();
            if (!r.width) return;

            const alto = btn.offsetHeight || 36;
            let top = r.top - alto - 8;          // arriba de la imagen
            if (top < 8) top = r.top + 8;        // sin lugar arriba: adentro de la imagen
            btn.style.top = top + 'px';
            btn.style.left = Math.max(8, r.left) + 'px';
        }
        window.addEventListener('resize', posicionar);

        setInterval(() => {
            const abierto = jQuery.magnificPopup.instance.isOpen;
            btn.style.display = abierto ? 'flex' : 'none';

            // Dentro del popup, para quedar siempre por encima de la imagen
            const wrap = document.querySelector('.mfp-wrap');
            if (abierto && wrap && btn.parentNode !== wrap) wrap.appendChild(btn);
            if (!abierto && btn.parentNode !== document.body) document.body.appendChild(btn);

            if (!abierto) return;
            posicionar();
            const d = datosActuales();
            if (d && d.src && d.src !== cache.src) {
                cache = { src: d.src, file: null };
                imagenComoArchivo(d.src, d.nombre)
                    .then(f => { if (cache.src === d.src) cache.file = f; })
                    .catch(() => { });
            }
        }, 150);

        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const d = datosActuales();
            if (!d) return;

            if (typeof window.gtag === 'function') {
                gtag('event', 'share', { method: 'WhatsApp', content_type: 'imagen_popup', item_id: d.nombre });
            }

            // Celular: compartir la imagen + texto
            const esCelular = window.matchMedia('(pointer: coarse)').matches;
            if (esCelular && navigator.share && navigator.canShare && cache.file && cache.src === d.src) {
                try {
                    if (navigator.canShare({ files: [cache.file] })) {
                        await navigator.share({ files: [cache.file], text: d.texto });
                        return;
                    }
                } catch (err) {
                    if (err && err.name === 'AbortError') return; // la persona canceló
                }
            }

            // Computadora o navegador sin soporte: compartir el link por WhatsApp
            window.open('https://wa.me/?text=' + encodeURIComponent(d.texto), '_blank', 'noopener');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();