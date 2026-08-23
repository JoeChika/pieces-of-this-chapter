// Final photo override: force the real hero endpoint and build the slideshow
// from the existing uploaded image assets. No embedded image data is used.
window.addEventListener('load', () => {
  const hero = document.querySelector('.hero-card .polaroid img');
  if (hero) {
    const heroUrl = '/api/hero?v=5';
    hero.src = heroUrl;
    hero.removeAttribute('srcset');
    hero.addEventListener('error', () => {
      // Keep the card visible even if a stale deployment cache briefly serves an old API response.
      hero.src = '/images/paragon-pink.svg?v=5';
    }, { once: true });
  }

  setTimeout(async () => {
    // The current HTML uses .photo-grid; older revisions used .photo-slideshow.
    const grid = document.querySelector('.photo-slideshow') || document.querySelector('.photo-grid');
    if (!grid) return;
    grid.classList.add('photo-slideshow');

    const photos = [
      {src:'/images/final-conversation.b64', alt:'A memory from the journey', title:'Growth in conversation.', text:'Some of the sweetest memories were made in ordinary moments.'},
      {src:'/images/slide-05.b64', alt:'Victory with friends', title:'Grateful for my people.', text:'The people who made the journey lighter, funnier, and sweeter.'},
      {src:'/images/final-labcoat.b64', alt:'Victory in her lab coat', title:'Becoming the pharmacist.', text:'A dream, a white coat, and a chapter worth every late night.'},
      {src:'/images/jersey.jpg', alt:'Victory in her jersey', title:'Walking into what’s next.', text:'A little joy, a lot of memories, and so much ahead.'},
      {src:'/images/kiss.b64', alt:'Victory blowing a kiss', title:'Still becoming. Always me.', text:'Grateful for the journey. God has been faithful through it all.'}
    ];

    const loaded = [];
    for (const p of photos) {
      try {
        const r = await fetch(p.src + '?v=5', { cache:'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = p.src.endsWith('.b64')
          ? 'data:image/jpeg;base64,' + (await r.text()).trim().replace(/\s/g,'')
          : p.src + '?v=5';
        loaded.push({...p, data});
      } catch (e) {
        console.warn('Photo skipped:', p.src, e);
      }
    }

    if (!loaded.length) return;

    grid.innerHTML = '<div class="slide-stage"></div><button class="slide-nav prev" type="button" aria-label="Previous photo">‹</button><button class="slide-nav next" type="button" aria-label="Next photo">›</button><div class="slide-dots"></div><div class="slide-caption"></div>';
    const stage = grid.querySelector('.slide-stage');
    const dots = grid.querySelector('.slide-dots');
    const cap = grid.querySelector('.slide-caption');
    let i = 0;
    let timer;

    function show(n) {
      i = (n + loaded.length) % loaded.length;
      const p = loaded[i];
      stage.innerHTML = '';
      const img = document.createElement('img');
      img.src = p.data;
      img.alt = p.alt;
      img.loading = 'eager';
      stage.appendChild(img);
      cap.innerHTML = '<strong>' + p.title + '</strong><span>' + p.text + '</span>';
      dots.querySelectorAll('button').forEach((b,j) => b.classList.toggle('active', j === i));
    }

    dots.innerHTML = loaded.map((_,j) => '<button type="button" aria-label="Go to photo ' + (j+1) + '"></button>').join('');
    dots.querySelectorAll('button').forEach((b,j) => b.onclick = () => { show(j); restart(); });
    grid.querySelector('.prev').onclick = () => { show(i-1); restart(); };
    grid.querySelector('.next').onclick = () => { show(i+1); restart(); };

    function restart() {
      clearInterval(timer);
      timer = setInterval(() => show(i+1), 5000);
    }

    show(0);
    restart();
  }, 300);
});
