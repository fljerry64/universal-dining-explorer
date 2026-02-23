let restaurants = [];

fetch('data/menus.json')
  .then(res => res.json())
  .then(data => {
    restaurants = data;
    render(restaurants);
  });

document.getElementById('search').addEventListener('input', filter);
document.getElementById('parkFilter').addEventListener('change', filter);

document.getElementById('darkToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

function filter() {
  const search = document.getElementById('search').value.toLowerCase();
  const park = document.getElementById('parkFilter').value;

  const filtered = restaurants.filter(r => {
    const matchesPark = park === "" || r.park === park;
    const matchesSearch =
      r.name.toLowerCase().includes(search) ||
      r.sections.some(section =>
        section.items.some(item =>
          item.name.toLowerCase().includes(search)
        )
      );
    return matchesPark && matchesSearch;
  });

  render(filtered);
}

function render(data) {
  const container = document.getElementById('restaurantList');
  container.innerHTML = '';

  data.forEach(r => {
    const div = document.createElement('div');
    div.className = 'restaurant';

    div.innerHTML = `
      <div class="restaurant-header">
        <h2>${r.name}</h2>
        <p>${r.park}</p>
      </div>
      <div class="menu">
        ${r.sections.map(section => `
          <div class="section">${section.name}</div>
          ${section.items.map(item => `
            <div class="menu-item">
              <span>${item.name}</span>
              <span>$${item.price}</span>
            </div>
          `).join('')}
        `).join('')}
      </div>
    `;

    div.querySelector('.restaurant-header').addEventListener('click', () => {
      const menu = div.querySelector('.menu');
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    container.appendChild(div);
  });
}
