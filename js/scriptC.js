/* script.js — La Matanza Clasificados */

/* ─────────────────────────────────────
   ISOTOPE + FILTROS
───────────────────────────────────── */
jQuery(document).ready(function ($) {

    var $grid = $('.portfolio-grid').isotope({
        itemSelector: '.item',
        layoutMode: 'fitRows',
        fitRows: {
            gutter: 16  /* mismo valor que margin-bottom de .item */
        }
    });

    // Reacomodar cuando cargan las imágenes (evita el encimado)
    $grid.imagesLoaded().progress(function () {
        $grid.isotope('layout');
    });

    // Filtro del menú
    $('.portfolio-menu ul li').click(function () {
        $('.portfolio-menu ul li').removeClass('active');
        $(this).addClass('active');
        var selector = $(this).attr('data-filter');
        $grid.isotope({ filter: selector });
        return false;
    });
});


/* ─────────────────────────────────────
   MAGNIFIC POPUP + LOTTIE LAZY
───────────────────────────────────── */
$(function () {

    // Lottie se carga solo la primera vez que se abre un popup
    let lottieInicializado = false;

    function inicializarLottie() {
        if (lottieInicializado) return;
        lottieInicializado = true;

        const animaciones = [
            { id: 'lottie-prev',  path: '/json/arrow-left.json' },
            { id: 'lottie-next',  path: '/json/arrow-right.json' },
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

    $('.popup-image').magnificPopup({
        type: 'image',
        gallery: { enabled: true },
        callbacks: {
            open: function () {
                inicializarLottie();
                agregarBotonEnlace(this.currItem);

                const mfpContent   = document.querySelector('.mfp-content');
                const lottieWrapper = document.querySelector('.lottie-wrapper');
                const closeWrapper  = document.querySelector('.lottie-close-wrapper');

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
            change: function () {
                const item = this.currItem;
                setTimeout(() => agregarBotonEnlace(item), 50);
            },
            close: function () {
                $('.popup-button').remove();
                $('.lottie-wrapper').css('display', 'none');
                $('.lottie-close-wrapper').css('display', 'none');

                const lottieWrapper = document.querySelector('.lottie-wrapper');
                const closeWrapper  = document.querySelector('.lottie-close-wrapper');
                if (lottieWrapper) document.body.appendChild(lottieWrapper);
                if (closeWrapper)  document.body.appendChild(closeWrapper);
            }
        }
    });

    function agregarBotonEnlace(item) {
        $('.popup-button').remove();
        const link   = $(item.el).attr('data-link');
        const nombre = $(item.el).attr('name') || 'WhatsApp';
        if (link) {
            const buttonHtml = `
                <div class="popup-button boton" style="text-align:center;">
                    <a href="${link}" target="_blank" class="btn">
                        <i class="fa-brands fa-whatsapp fa-lg boton" style="color:#ffffff;"></i> ${nombre}
                    </a>
                </div>`;
            $('#lottie-next').before(buttonHtml);
        }
    }

    // Controles Lottie
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
});


/* ─────────────────────────────────────
   DOM READY — todo lo que necesita el DOM
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    /* ── Carrusel ── */
    const track  = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots   = document.querySelectorAll('.dot');
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

    setInterval(() => {
        index = (index + 1) % slides.length;
        goToSlide(index);
    }, 5000);


    /* ── Navbar: toggle, cierre por link y cierre por clic externo ── */
    const toggle = document.querySelector('.navbar-toggle');
    const menu   = document.querySelector('.navbar-menu');

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
    const buttons      = document.querySelectorAll('.portfolio-menu li');
    const tituloFiltro = document.getElementById('titulo-filtro');

    const imagenesFiltro = {
        '*':        '/img/filtros/todo.avif',
        '.estet':   '/img/filtros/estetica.avif',
        '.tecnico': '/img/filtros/tecnicos.avif',
        '.abog':    '/img/filtros/abogados.avif',
        '.clases':  '/img/filtros/clases.avif',
        '.lava':    '/img/filtros/lavadero.avif',
        '.comidas': '/img/filtros/comidas.avif',
        '.barber':  '/img/filtros/barberia.avif',
        '.pastel':  '/img/filtros/pasteleria.avif',
        '.canina':  '/img/filtros/canina.avif',
        '.eventos': '/img/filtros/eventos.avif'
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

    // Activar "Todo" al cargar
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


    /* ── Tap Lottie (ícono de toque en cada card) ── */
    document.querySelectorAll('.item').forEach(item => {
        const div = document.createElement('div');
        div.classList.add('tap-lottie');
        item.prepend(div);
    });

    document.querySelectorAll('.tap-lottie').forEach(el => {
        lottie.loadAnimation({
            container: el,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/json/Touch animation blue.json'
        });
    });


    /* ── Scroll premium al filtrar ── */
    const botones = document.querySelectorAll('.filter-btn');
    const titulo  = document.querySelector('.tituloprin');

    function scrollPremium(target, duration = 800) {
        const start    = window.pageYOffset;
        const end      = target.getBoundingClientRect().top + start - 30;
        const distance = end - start;
        let startTime  = null;

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed  = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, start + distance * easeInOutCubic(progress));
            if (elapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    }

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            scrollPremium(titulo);
            titulo.classList.remove('animar-titulo');
            void titulo.offsetWidth; // fuerza reflow para reiniciar animación
            titulo.classList.add('animar-titulo');
        });
    });

});
