/* script.js — La Matanza Clasificados */

/* ─────────────────────────────────────
   ISOTOPE + FILTROS
───────────────────────────────────── */
jQuery(document).ready(function ($) {

 /*   var $grid = $('.portfolio-grid').isotope({
        itemSelector: '.item',
        layoutMode: 'fitRows',
        fitRows: {
            gutter: 16  /* mismo valor que margin-bottom de .item */
       // }
    //});


    var $grid = $('.portfolio-grid').isotope({
    itemSelector: '.item',
    layoutMode: 'masonry',   // ← más robusto que fitRows
    masonry: {
        columnWidth: '.item', // lee el CSS directamente
        gutter: 16
    }
});
    function actualizarActivos() {
    const iso = $grid.data('isotope');
    if (!iso) return;

    $('.popup-image').removeClass('activo');

    iso.filteredItems.forEach(item => {
        $(item.element).find('.popup-image').addClass('activo');
    });

    
}


// Ejecutar en cada filtrado
$grid.on('arrangeComplete', actualizarActivos);

// Forzar primer estado
//$grid.isotope('layout');


// 🔥 Inicialización correcta
$grid.imagesLoaded(function () {
    $grid.isotope('layout');
    actualizarActivos();
    setTimeout(actualizarActivos, 300);
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

    $('.portfolio-grid').magnificPopup({


    delegate: '.popup-image.activo', // 👈 SOLO LOS FILTRADOS
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


    /* ── Swipe táctil en Magnific Popup ── */
(function () {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        // Solo actuar si el popup está abierto
        if (!$.magnificPopup.instance.isOpen) return;

        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        // Ignorar si el gesto fue más vertical que horizontal
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;

        // Mínimo 50px para considerar que fue un swipe intencional
        if (Math.abs(deltaX) < 50) return;

        if (deltaX < 0) {
            $.magnificPopup.instance.next(); // swipe izquierda → siguiente
        } else {
            $.magnificPopup.instance.prev(); // swipe derecha → anterior
        }
    }, { passive: true });
})();
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
        '.eventos': '/img/filtros/eventos.avif',
        '.oficios': '/img/filtros/oficios.avif',
        '.graficas':'/img/filtros/graficas.avif',
        '.comercios':'/img/filtros/comercios.avif',
        '.gym':'/img/filtros/gym.avif',
        '.salud':'/img/filtros/salud.avif',
        '.mecanica':'/img/filtros/mecanicos.avif',
        '.modista':'/img/filtros/modista.avif',
        '.indumentaria':'/img/filtros/indumentaria.avif'
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

// 👇 función mejorada
function scrollPremium(target, duration = 800) {
    const start = window.pageYOffset;

    // getBoundingClientRect da la posición real en el viewport en el momento
    // del click; sumando pageYOffset obtenemos la posición absoluta en el
    // documento, sin depender del tamaño de los divs contenedores.
    // El offset se calcula dinámicamente según la altura real del navbar,
    // para que funcione igual en todos los dispositivos.
    const navbar = document.querySelector('.navbar') || document.querySelector('nav');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const offset = navbarHeight - 50; // 10px de margen visual extra
    const end = target.getBoundingClientRect().top + window.pageYOffset - offset;

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

        if (elapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

    /*function scrollPremium(target, duration = 800) {
        const start    = window.pageYOffset;
        const end      = target.getBoundingClientRect().top + start - 0;
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
    }*/


        const $grid = $('.portfolio-grid');

botones.forEach(boton => {
    boton.addEventListener('click', () => {

        // Esperar a que Isotope termine de ordenar
        $grid.one('arrangeComplete', function () {

            // Doble requestAnimationFrame: el primero avisa al browser que
            // queremos medir, el segundo espera a que el browser haya
            // terminado de pintar el nuevo layout (incluyendo el #titulo-filtro
            // que pasó de display:none a display:flex). Sin este delay,
            // getBoundingClientRect devuelve la posición pre-layout en
            // dispositivos lentos y el scroll termina más abajo.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollPremium(titulo);

                    // reiniciar animación del título
                    titulo.classList.remove('animar-titulo');
                    void titulo.offsetWidth;
                    titulo.classList.add('animar-titulo');
                });
            });

        });

    });
});

    /*botones.forEach(boton => {
        boton.addEventListener('click', () => {
            scrollPremium(titulo);
            titulo.classList.remove('animar-titulo');
            void titulo.offsetWidth; // fuerza reflow para reiniciar animación
            titulo.classList.add('animar-titulo');
        });
    });*/

});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    const $grid = $('.portfolio-grid');
    if ($grid.data('isotope')) {
      $grid.isotope('layout');
    }
  }, 300); // pequeño delay para que el browser termine de rotar
});
