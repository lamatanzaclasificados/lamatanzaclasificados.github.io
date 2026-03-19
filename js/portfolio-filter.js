document.querySelectorAll('.filter-btn').forEach(btn => {
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
  });
});
