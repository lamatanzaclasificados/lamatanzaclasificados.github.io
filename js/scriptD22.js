/* script.js — La Matanza Clasificados */

/* ─────────────────────────────────────
   ISOTOPE + FILTROS
───────────────────────────────────── */
jQuery(document).ready(function ($) {

    var $grid = $('.portfolio-grid').isotope({
        itemSelector: '.item',
        layoutMode: 'masonry',
        masonry: {
            columnWidth: '.item',
            gutter: 16
        }

    });

    window.actualizarActivos = function () {
        const iso = $('.portfolio-grid').data('isotope');
        if (!iso) return;

        $('.popup-image').removeClass('activo');

        iso.filteredItems.forEach(item => {
            const el = item.element;
            if (el.style.display !== 'none') {
                $(el).find('.popup-image').addClass('activo');
            }
        });

        $('.portfolio-grid .item:not([style*="display: none"]) .popup-image').addClass('activo');
    }

    $grid.on('arrangeComplete', actualizarActivos);

    $grid.imagesLoaded(function () {
        $grid.isotope('layout');
        actualizarActivos();
        setTimeout(actualizarActivos, 300);
    });

   
    $grid.imagesLoaded().progress(function () {
        $grid.isotope('layout');
    });

    $('.portfolio-menu ul li').click(function () {
        $('.portfolio-menu ul li').removeClass('active');
        $(this).addClass('active');
        var selector = $(this).attr('data-filter');
        window.currentFilter = selector;
        if (window.resetLoadMore) window.resetLoadMore(selector);
        return false;
    });

});


/* ─────────────────────────────────────
   DETECCIÓN DE CONEXIÓN
───────────────────────────────────── */
function detectarConexion() {
    // Usa getIsSlow() del HTML si está disponible (permite testing centralizado)
    if (typeof getIsSlow === 'function') {
        const isSlow = getIsSlow();
        return { isSlow, isMedium: false };
    }

    const conn = navigator.connection
        || navigator.mozConnection
        || navigator.webkitConnection;

    const isSlow = conn?.saveData
        || conn?.effectiveType === 'slow-2g'
        || conn?.effectiveType === '2g';

    const isMedium = conn?.effectiveType === '3g';

    return { isSlow, isMedium };
}


/* ─────────────────────────────────────
   MAGNIFIC POPUP + LOTTIE LAZY
───────────────────────────────────── */
$(function () {

    let lottieInicializado = false;

    function inicializarLottie() {
        const { isSlow, isMedium } = detectarConexion();
        if (isSlow || isMedium) return;

        if (lottieInicializado) return;
        lottieInicializado = true;

        const animaciones = [
            { id: 'lottie-prev', path: '/json/arrow-left.json' },
            { id: 'lottie-next', path: '/json/arrow-right.json' },
            { id: 'lottie-close', path: '/json/close.json' }
        ];

        animaciones.forEach(({ id, path }) => {
            const el = document.getElementById(id);
            if (el) {
                lottie.loadAnimation({
                    container: el,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: path
                });
            }
        });
    }

    /* ── Helpers fallback ── */
    function mostrarFallback() {
        const mfpContent = document.querySelector('.mfp-content');
        const fw = document.querySelector('.fallback-wrapper');
        const fc = document.querySelector('.fallback-close-wrapper');

        if (fw && mfpContent && !mfpContent.contains(fw)) {
            mfpContent.appendChild(fw);
        }
        if (fc && mfpContent && !mfpContent.contains(fc)) {
            mfpContent.appendChild(fc);
        }

        if (fw) fw.style.display = 'grid';
        if (fc) fc.style.display = 'flex';
    }

    function ocultarFallback() {
        const fw = document.querySelector('.fallback-wrapper');
        const fc = document.querySelector('.fallback-close-wrapper');

        if (fw) { fw.style.display = 'none'; document.body.appendChild(fw); }
        if (fc) { fc.style.display = 'none'; document.body.appendChild(fc); }
    }

    $('.portfolio-grid').magnificPopup({

        delegate: '.popup-image.activo',
        type: 'image',
        gallery: { enabled: true },
        callbacks: {
            open: function () {
                inicializarLottie();
                agregarBotonEnlace(this.currItem);

                const { isSlow, isMedium } = detectarConexion();

                if (isSlow || isMedium) {
                    mostrarFallback();
                    return;
                }

                const mfpContent = document.querySelector('.mfp-content');
                const lottieWrapper = document.querySelector('.lottie-wrapper');
                const closeWrapper = document.querySelector('.lottie-close-wrapper');

                if (lottieWrapper && mfpContent && !mfpContent.contains(lottieWrapper)) {
                    mfpContent.appendChild(lottieWrapper);
                }
                if (closeWrapper && mfpContent && !mfpContent.contains(closeWrapper)) {
                    mfpContent.appendChild(closeWrapper);
                }

                $('.lottie-wrapper').css('display', 'flex');
                $('#lottie-prev').css('display', 'flex');
                $('#lottie-next').css('display', 'flex');
                $('.lottie-close-wrapper').css('display', 'flex');
            },
            beforeChange: function () {
                // Ocultar imagen al cambiar
                const mfpImg = document.querySelector('.mfp-img');
                if (mfpImg) mfpImg.style.opacity = '0';
            },

            imageLoadComplete: function () {
                // Mostrar imagen cuando terminó de cargar
                const mfpImg = document.querySelector('.mfp-img');
                if (mfpImg) {
                    mfpImg.style.transition = 'opacity 0.3s ease';
                    mfpImg.style.opacity = '1';
                }
            },
            change: function () {
                const item = this.currItem;
                setTimeout(() => agregarBotonEnlace(item), 50);
            },
            close: function () {
                $('.popup-button').remove();
                $('.lottie-wrapper').css('display', 'none');
                $('.lottie-close-wrapper').css('display', 'none');

                ocultarFallback();

                const lottieWrapper = document.querySelector('.lottie-wrapper');
                const closeWrapper = document.querySelector('.lottie-close-wrapper');
                if (lottieWrapper) document.body.appendChild(lottieWrapper);
                if (closeWrapper) document.body.appendChild(closeWrapper);
            }
        }

    });

 /*   function agregarBotonEnlace(item) {
        $('.popup-button').remove();
        const link = $(item.el).attr('data-link');
        const nombre = $(item.el).attr('name') || 'WhatsApp';
        if (!link) return;

        const { isSlow, isMedium } = detectarConexion();

        if (isSlow || isMedium) {
            const fallbackWrapper = document.querySelector('.fallback-wrapper');
            if (fallbackWrapper) {
                const btn = document.createElement('div');
                btn.className = 'popup-button boton';
                btn.innerHTML = `<a href="${link}" target="_blank" class="btn">
                    <i class="fa-brands fa-whatsapp fa-lg boton" style="color:#ffffff;"></i> ${nombre}
                </a>`;
                // Insertar entre fallback-prev y fallback-next
                const nextBtn = document.getElementById('fallback-next');
                fallbackWrapper.insertBefore(btn, nextBtn);
            }
        } else {
            const buttonHtml = `
                <div class="popup-button boton" style="text-align:center;">
                    <a href="${link}" target="_blank" class="btn">
                        <i class="fa-brands fa-whatsapp fa-lg boton" style="color:#ffffff;"></i> ${nombre}
                    </a>
                </div>`;
            $('#lottie-next').before(buttonHtml);
        }
    }*/

    /* corregimos aparicion del boton*/

        function agregarBotonEnlace(item) {
    $('.popup-button').remove();
    const link = $(item.el).attr('data-link');
    const nombre = $(item.el).attr('name') || 'WhatsApp';
    if (!link) return;

    const { isSlow, isMedium } = detectarConexion();

    if (isSlow || isMedium) {
        // Intentar insertar, con reintentos si fallback-wrapper aún no existe
        let intentos = 0;
        const maxIntentos = 10;

        function intentarInsertar() {
            const fallbackWrapper = document.querySelector('.fallback-wrapper');

            if (fallbackWrapper) {
                // Ya existe, insertar normalmente
                const btn = document.createElement('div');
                btn.className = 'popup-button boton';
                btn.innerHTML = `<a href="${link}" target="_blank" class="btn">
                    <i class="fa-brands fa-whatsapp fa-lg boton" style="color:#ffffff;"></i> ${nombre}
                </a>`;
                const nextBtn = document.getElementById('fallback-next');
                fallbackWrapper.insertBefore(btn, nextBtn);

            } else if (intentos < maxIntentos) {
                // Aún no existe, reintentar en 200ms
                intentos++;
                setTimeout(intentarInsertar, 200);

            } else {
                // Último recurso: insertar en mfp-content directamente
                const mfpContent = document.querySelector('.mfp-content');
                if (mfpContent) {
                    const btn = document.createElement('div');
                    btn.className = 'popup-button boton';
                    btn.style.textAlign = 'center';
                    btn.innerHTML = `<a href="${link}" target="_blank" class="btn">
                        <i class="fa-brands fa-whatsapp fa-lg boton" style="color:#ffffff;"></i> ${nombre}
                    </a>`;
                    mfpContent.appendChild(btn);
                }
            }
        }

        intentarInsertar();

    } else {
        const buttonHtml = `
            <div class="popup-button boton" style="text-align:center;">
                <a href="${link}" target="_blank" class="btn">
                    <i class="fa-brands fa-whatsapp fa-lg boton" style="color:#ffffff;"></i> ${nombre}
                </a>
            </div>`;
        $('#lottie-next').before(buttonHtml);
    }
}

    /* ── Controles Lottie ── */
    $('#lottie-prev').on('click', function (e) {
        e.stopPropagation();
        $.magnificPopup.instance.prev();
    });

    $('#lottie-next').on('click', function (e) {
        e.stopPropagation();
        $.magnificPopup.instance.next();
    });

    $('#lottie-close').on('click', function (e) {
        e.stopPropagation();
        $.magnificPopup.close();
    });

    /* ── Controles fallback ── */
    document.getElementById('fallback-prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        $.magnificPopup.instance.prev();
    });

    document.getElementById('fallback-next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        $.magnificPopup.instance.next();
    });

    document.getElementById('fallback-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        $.magnificPopup.close();
    });

    /* ── Swipe táctil en Magnific Popup ── */
    (function () {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', function (e) {
            if (!$.magnificPopup.instance.isOpen) return;

            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;

            if (Math.abs(deltaY) > Math.abs(deltaX)) return;
            if (Math.abs(deltaX) < 50) return;

            if (deltaX < 0) {
                $.magnificPopup.instance.next();
            } else {
                $.magnificPopup.instance.prev();
            }
        }, { passive: true });
    })();
});


/* ─────────────────────────────────────
   DOM READY
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    /* ── Carrusel ── */
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let index = 0;

    function goToSlide(i) {
        index = i;
        track.style.transform = `translateX(-${index * 100}%)`;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide)));
    });

    const { isSlow: conexionLenta } = detectarConexion();
    if (!conexionLenta) {
        setInterval(() => {
            index = (index + 1) % slides.length;
            goToSlide(index);
        }, 5000);
    }


    /* ── Navbar ── */
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');

    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });

    document.querySelectorAll('.navbar-menu a').forEach(link => {
        link.addEventListener('click', () => menu.classList.remove('open'));
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('open');
        }
    });


    /* ── Fondo dinámico por categoría ── */
    const buttons = document.querySelectorAll('.portfolio-menu li');
    const tituloFiltro = document.getElementById('titulo-filtro');

    const imagenesFiltro = {
        '*': '/img/filtros/todo.avif',
        '.estet': '/img/filtros/estetica.avif',
        '.tecnico': '/img/filtros/tecnicos.avif',
        '.abog': '/img/filtros/abogados.avif',
        '.clases': '/img/filtros/clases.avif',
        '.lava': '/img/filtros/lavadero.avif',
        '.comidas': '/img/filtros/comidas.avif',
        '.barber': '/img/filtros/barberia.avif',
        '.pastel': '/img/filtros/pasteleria.avif',
        '.canina': '/img/filtros/canina.avif',
        '.eventos': '/img/filtros/eventos.avif',
        '.oficios': '/img/filtros/oficios.avif',
        '.graficas': '/img/filtros/graficas.avif',
        '.comercios': '/img/filtros/comercios.avif',
        '.gym': '/img/filtros/gym.avif',
        '.salud': '/img/filtros/salud.avif',
        '.mecanica': '/img/filtros/mecanicos.avif',
        '.modista': '/img/filtros/modista.avif',
        '.indumentaria': '/img/filtros/indumentaria.avif'
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            const filtro = this.getAttribute('data-filter');
            tituloFiltro.style.display = 'flex';
            if (imagenesFiltro[filtro]) {
                tituloFiltro.style.backgroundImage = `url('${imagenesFiltro[filtro]}')`;
            } else {
                tituloFiltro.style.backgroundImage = 'none';
                tituloFiltro.style.display = 'none';
            }
        });
    });

    const botonTodo = document.querySelector('.portfolio-menu li[data-filter="*"]');
    if (botonTodo) botonTodo.click();


    /* ── Modal legal ── */
    const modal = document.getElementById('modalLegal');

    document.getElementById('abrirModal').onclick = (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
    };

    document.getElementById('cerrarModal').onclick = () => {
        modal.style.display = 'none';
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });


    /* ── Tap indicator (CSS, sin Lottie) ── */
    const { isSlow } = detectarConexion();
    if (!isSlow) {
        document.querySelectorAll('.item').forEach(item => {
            const div = document.createElement('div');
            div.classList.add('tap-lottie');
            item.prepend(div);

        });
    }


    /* ── Scroll premium al filtrar ── */
    const botones = document.querySelectorAll('.filter-btn');
    const titulo = document.querySelector('.tituloprin');

    function scrollPremium(target, duration = 800) {
        const start = window.pageYOffset;
        const navbar = document.querySelector('.navbar') || document.querySelector('nav');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const offset = navbarHeight - 50;
        //const end = target.getBoundingClientRect().top + window.pageYOffset - offset;

        // ✅ Después — posición absoluta en el documento, siempre correcta
        const end = target.offsetTop - offset;
        const distance = end - start;
        let startTime = null;

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, start + distance * easeInOutCubic(progress));
            if (elapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    }

    // ← Exponer globalmente para uso desde applyVisibility
    window.scrollPremium = scrollPremium;
    window.tituloprin = titulo;

    const $grid = $('.portfolio-grid');

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            $grid.one('arrangeComplete', function () {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        scrollPremium(titulo);
                        titulo.classList.remove('animar-titulo');
                        void titulo.offsetWidth;
                        titulo.classList.add('animar-titulo');
                    });
                });
            });
        });
    });

});


/* ─────────────────────────────────────
   LOAD MORE
───────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    const items = Array.from(document.querySelectorAll('.portfolio-grid .item'));
    const step = 8;

    window.currentFilter = window.currentFilter || '*';
    let visibleCount = 8;

    function getFilteredItems(filter) {
        if (!filter || filter === '*') return items;
        return items.filter(item => item.matches(filter));
    }

    function applyVisibility(soloLayout = false) {
        const filter = window.currentFilter || '*';
        const filteredItems = getFilteredItems(filter);
        const isTodo = filter === '*';

        items.forEach(item => {
            const inFilter = filter === '*' || item.matches(filter);
            const idx = filteredItems.indexOf(item);
            const inPage = isTodo ? idx < visibleCount : idx >= 0;
            item.style.display = (inFilter && inPage) ? '' : 'none';
        });

        const $grid = $('.portfolio-grid');

        if ($grid.data('isotope')) {
            if (soloLayout) {
                $grid.isotope('layout');
                window.actualizarActivos && window.actualizarActivos();
            } else {
                $grid.isotope({ filter: filter });
                setTimeout(() => {
                    window.actualizarActivos && window.actualizarActivos();

                    // ← Scroll premium también en modo slow
                    if (window.scrollPremium && window.tituloprin) {
                        window.scrollPremium(window.tituloprin);
                        window.tituloprin.classList.remove('animar-titulo');
                        void window.tituloprin.offsetWidth;
                        window.tituloprin.classList.add('animar-titulo');
                    }
                }, 300);
            }
        } else {
            window.actualizarActivos && window.actualizarActivos();
        }

        button.style.display = (isTodo && visibleCount < filteredItems.length) ? '' : 'none';
    }

    window.resetLoadMore = function (newFilter) {
        window.currentFilter = newFilter;
        visibleCount = 8;
        applyVisibility(false);
    };

    const button = document.getElementById('load-more-btn');
    applyVisibility(false);

    button.addEventListener('click', () => {
        visibleCount += step;
        applyVisibility(true);
    });
});
