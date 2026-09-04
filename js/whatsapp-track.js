/* Tracking de clicks en botones de WhatsApp */
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href*="wa.link"], a[href*="wa.me"], a[href*="api.whatsapp.com"]');
  if (!link) return;

  const esContactoDirectorio = link.href.includes('wa.link/t659hj'); // tu link propio de "Contactanos"

  gtag('event', esContactoDirectorio ? 'click_whatsapp_directorio' : 'click_whatsapp_comercio', {
    business: esContactoDirectorio ? 'La Matanza Clasificados' : document.title,
    link_url: link.href
  });
});