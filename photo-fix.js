// Final image pass: reliable hero loading plus the clean four-photo slideshow. v11
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .photo-slideshow{display:block !important;position:relative;margin:32px auto 0;max-width:420px;background:var(--cream);padding:14px;box-shadow:var(--shadow);min-height:430px}
    .slide-stage{width:100%;aspect-ratio:4/5;overflow:hidden;background:#e8ddce}
    .slide-stage img{display:block;width:100%;height:100%;object-fit:cover;image-rendering:auto;filter:contrast(1.035) saturate(1.035);transform:translateZ(0);backface-visibility:hidden}
    .hero-card .polaroid img{display:block;width:100%;height:auto;object-fit:cover;image-rendering:auto;filter:contrast(1.035) saturate(1.035);transform:translateZ(0);backface-visibility:hidden}
    .slide-nav{position:absolute;top:42%;width:42px;height:42px;border:0;border-radius:50%;background:rgba(255,250,242,.94);color:var(--ink);font-size:30px;line-height:1;cursor:pointer;box-shadow:0 5px 18px rgba(0,0,0,.12)}
    .slide-nav.prev{left:24px}.slide-nav.next{right:24px}
    .slide-dots{display:flex;justify-content:center;gap:7px;margin:14px 0 4px}
    .slide-dots button{width:7px;height:7px;border:0;border-radius:50%;padding:0;background:var(--line);cursor:pointer}
    .slide-dots button.active{background:var(--accent)}
    .slide-caption{padding:10px 5px 3px;text-align:center}
    .slide-caption strong{display:block;font-family:'Playfair Display',serif;font-size:22px}
    .slide-caption span{display:block;color:var(--muted);font-size:11px;margin-top:3px}
  `;
  document.head.appendChild(style);

  const hero = document.querySelector('.hero-card .polaroid img');
  if (hero) {
    hero.src = '/api/hero?v=11';
    hero.removeAttribute('srcset');
    hero.loading = 'eager';
    hero.setAttribute('fetchpriority', 'high');
    hero.onerror = () => { console.warn('Hero endpoint failed to load.'); hero.onerror = null; };
  }

  const grid = document.querySelector('.photo-slideshow') || document.querySelector('.photo-grid');
  if (!grid) return;
  grid.classList.add('photo-slideshow');
  const photos = [
    {src:'/images/friends-full.jpg', alt:'Victory with friends', title:'Grateful for my people.', text:'The people who made the journey lighter, funnier, and sweeter.'},
    {src:'/images/labcoat-full.jpg', alt:'Victory in her lab coat', title:'Becoming the pharmacist.', text:'A dream, a white coat, and a chapter worth every late night.'},
    {src:'/images/jersey.jpg', alt:'Victory in her jersey', title:'Walking into what’s next.', text:'A little joy, a lot of memories, and so much ahead.'},
    {src:'/images/kiss-full.jpg', alt:'Victory blowing a kiss', title:'Still becoming. Always me.', text:'Grateful for the journey. God has been faithful through it all.'}
  ];

  const preload = photos.map(p => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({...p, data: p.src + '?v=11', ok: true});
    img.onerror = () => resolve({...p, ok: false});
    img.src = p.src + '?v=11';
  }));

  Promise.all(preload).then(results => {
    const loaded = results.filter(r => r.ok);
    if (!loaded.length) return;
    grid.innerHTML = '<div class="slide-stage"></div><button class="slide-nav prev" type="button" aria-label="Previous photo">‹</button><button class="slide-nav next" type="button" aria-label="Next photo">›</button><div class="slide-dots"></div><div class="slide-caption"></div>';
    const stage = grid.querySelector('.slide-stage'), dots = grid.querySelector('.slide-dots'), cap = grid.querySelector('.slide-caption');
    let i = 0, timer;
    function show(n) {
      i = (n + loaded.length) % loaded.length;
      const p = loaded[i]; stage.innerHTML = '';
      const img = document.createElement('img'); img.src = p.data; img.alt = p.alt; img.loading = 'eager'; stage.appendChild(img);
      cap.innerHTML = '<strong>' + p.title + '</strong><span>' + p.text + '</span>';
      dots.querySelectorAll('button').forEach((b,j) => b.classList.toggle('active', j === i));
    }
    dots.innerHTML = loaded.map((_,j) => '<button type="button" aria-label="Go to photo ' + (j+1) + '"></button>').join('');
    dots.querySelectorAll('button').forEach((b,j) => b.onclick = () => {show(j);restart();});
    grid.querySelector('.prev').onclick = () => {show(i-1);restart();}; grid.querySelector('.next').onclick = () => {show(i+1);restart();};
    function restart(){clearInterval(timer);timer=setInterval(() => show(i+1),5000);}
    show(0); restart();
  });
})();
