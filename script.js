
/**/
jQuery(document).ready(function ($) {

    // 1. Inicializar Isotope después de que carguen las imágenes
    var $portfolioItems = $('.portfolio-item');

    var $grid = $portfolioItems.isotope({
        itemSelector: '.item',
        layoutMode: 'fitRows'
    });

    // Reacomodar cuando cargan las imágenes (soluciona el encimado)
    $grid.imagesLoaded().progress(function () {
        $grid.isotope('layout');
    });

    // 2. FILTRO del menú
    $('.portfolio-menu ul li').click(function () {
        $('.portfolio-menu ul li').removeClass('active');
        $(this).addClass('active');

        var selector = $(this).attr('data-filter');
        $grid.isotope({ filter: selector });

        return false;
    });

    // 3. Magnific Popup inicializado correctamente
    $('.popup-btn').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });

});
