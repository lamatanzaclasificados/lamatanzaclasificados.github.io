/*document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    document.querySelectorAll('.filter-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.portfolio-grid .item')
      .forEach(item => {
        if (filter === '*' || item.classList.contains(filter.substring(1))) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

       setTimeout(() => {
      AOS.refresh();
    }, 300);


  });


});*/

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        document.querySelectorAll('.filter-btn')
            .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Delegar toda la lógica de visibilidad y botón al load-more
        if (typeof window.resetLoadMore === 'function') {
            window.resetLoadMore(filter);
        }

        setTimeout(() => {
            AOS.refresh();
        }, 300);
    });
});
