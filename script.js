//NO $(document).ready(function () {
//jQuery(document).ready(function ($) {    
    // $('.portfolio-item').isotope({
    //  	itemSelector: '.item',
    //  	layoutMode: 'fitRows'
    //  });
    // $('.portfolio-menu ul li').click(function () {
    //     $('.portfolio-menu ul li').removeClass('active');
    //     $(this).addClass('active');

    //     var selector = $(this).attr('data-filter');
    //     $('.portfolio-item').isotope({
    //         filter: selector
    //     });
    //     return false;
    // })
    // COMENTARIO $(document).ready(function () {
//     jQuery(document).ready(function ($) {       
//         var popup_btn = $('.popup-btn');
//         popup_btn.magnificPopup({
//             type: 'image',
//             gallery: {
//                 enabled: true
//             }
//         });
//     });
// });


//PRUEBA 

jQuery(document).ready(function ($) {
// Initialize Isotope
var $portfolioItems = $('.portfolio-item');
$portfolioItems.isotope({
    itemSelector: '.item',
    layoutMode: 'fitRows'
});

// Handle the menu click to filter items
$('.portfolio-menu ul li').click(function () {
    // Add active class to the clicked item
    $('.portfolio-menu ul li').removeClass('active');
    $(this).addClass('active');

    // Get the filter selector from data-filter attribute
    var selector = $(this).attr('data-filter');

    // Filter the items based on the selected category
    $portfolioItems.isotope({
        filter: selector
    });

    return false; // Prevent default behavior
});

jQuery(document).ready(function ($) {       
    var popup_btn = $('.popup-btn');
    popup_btn.magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
}); 

});