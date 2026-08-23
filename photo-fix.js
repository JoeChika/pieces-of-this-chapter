// Final photo override: one hero source and one slideshow source of truth.
window.addEventListener('load', () => {
  const hero = document.querySelector('.hero-card .polaroid img');
  if (hero) { hero.src = '/api/hero?v=2'; hero.removeAttribute('srcset'); }

  setTimeout(async () => {
    const grid = document.querySelector('.photo-slideshow');
    if (!grid) return;
    const photos = [
      {src:'/images/final-conversation.b64', alt:'A memory from the journey', title:'Growth in conversation.', text:'Some of the sweetest memories were made in ordinary moments.'},
      {src:'/images/slide-05.b64', alt:'Victory with friends', title:'Grateful for my people.', text:'The people who made the journey lighter, funnier, and sweeter.'},
      {src:'/images/final-labcoat.b64', alt:'Victory in her lab coat', title:'Becoming the pharmacist.', text:'A dream, a white coat, and a chapter worth every late night.'},
      {src:'/images/jersey.jpg', alt:'Victory in her jersey', title:'Walking into what’s next.', text:'A little joy, a lot of memories, and so much ahead.'},
      {src:'/images/kiss.b64', alt:'Victory blowing a kiss', title:'Still becoming. Always me.', text:'Grateful for the journey. God has been faithful through it all.'}
    ];
    async function photo(p){
      const r=await fetch(p.src+'?v=final',{cache:'no-store'}); if(!r.ok) throw Error(p.src);
      if(p.src.endsWith('.b64')) return {...p,data:'data:image/jpeg;base64,'+(await r.text()).trim().replace(/\s/g,'')};
      return {...p,data:p.src+'?v=final'};
    }
    const loaded=[]; for(const p of photos){try{loaded.push(await photo(p))}catch(e){console.warn('Final slideshow photo skipped',e)}}
    if(!loaded.length)return;
    grid.innerHTML='<div class="slide-stage"></div><button class="slide-nav prev" type="button" aria-label="Previous photo">‹</button><button class="slide-nav next" type="button" aria-label="Next photo">›</button><div class="slide-dots"></div><div class="slide-caption"></div>';
    const stage=grid.querySelector('.slide-stage'), dots=grid.querySelector('.slide-dots'), cap=grid.querySelector('.slide-caption'); let i=0,t;
    function show(n){i=(n+loaded.length)%loaded.length;const p=loaded[i];stage.innerHTML='';const img=document.createElement('img');img.src=p.data;img.alt=p.alt;img.loading='eager';stage.appendChild(img);cap.innerHTML='<strong>'+p.title+'</strong><span>'+p.text+'</span>';dots.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('active',j===i));}
    dots.innerHTML=loaded.map((_,j)=>'<button type="button" aria-label="Go to photo '+(j+1)+'"></button>').join(''); dots.querySelectorAll('button').forEach((b,j)=>b.onclick=()=>{show(j);restart()});
    grid.querySelector('.prev').onclick=()=>{show(i-1);restart()}; grid.querySelector('.next').onclick=()=>{show(i+1);restart()};
    function restart(){clearInterval(t);t=setInterval(()=>show(i+1),5000)} show(0); restart();
  },1200);
});
