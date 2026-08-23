// The slideshow is initialized only by script.js. This file only provides a robust server-side hero fallback.
window.addEventListener('load', () => {
  const hero = document.querySelector('.hero-card .polaroid img');
  if (hero) {
    hero.src = '/api/hero?v=1';
    hero.removeAttribute('srcset');
  }
});
