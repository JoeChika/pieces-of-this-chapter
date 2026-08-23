(()=>{
const VERSION='20260823-final-photo-set-v1';
const photos=[
 {src:'/images/slide-02.b64',alt:'A memory from the journey',title:'Growth in conversation.',text:'Some of the sweetest memories were made in ordinary moments.'},
 {src:'/images/slide-05.b64',alt:'Victory with friends',title:'Grateful for my people.',text:'The people who made the journey lighter, funnier, and sweeter.'},
 {src:'/images/paragon-coat.jpg',alt:'Victory in her lab coat',title:'Becoming the pharmacist.',text:'A dream, a white coat, and a chapter worth every late night.'},
 {src:'/images/jersey.jpg',alt:'Victory in her jersey',title:'Walking into what’s next.',text:'A little joy, a lot of memories, and so much ahead.'},
 {src:'/images/kiss.b64',alt:'Victory blowing a kiss',title:'Still becoming. Always me.',text:'Grateful for the journey. God has been faithful through it all.'}
];
async function load(src){
 const r=await fetch(src+'?v='+VERSION,{cache:'no-store'});if(!r.ok)throw Error(src+' '+r.status);
 if(src.endsWith('.b64')){const text=(await r.text()).trim();const raw=atob(text.replace(/\s/g,''));const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));}
 return src+'?v='+VERSION;
}
async function loadHero(){
 const parts=['top-photo-01.b64p','top-photo-02.b64p','top-photo-03.b64p','top-photo-04.b64p'];
 const texts=await Promise.all(parts.map(async p=>(await fetch('/images/'+p+'?v='+VERSION,{cache:'no-store'})).text()));
 const raw=atob(texts.join(''));const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));
}
async function run(){
 const hero=document.querySelector('.hero-card .polaroid img');try{if(hero)hero.src=await loadHero();}catch(e){console.warn('hero photo failed',e)}
 const grid=document.querySelector('.photo-grid');if(!grid)return;const loaded=[];
 for(const p of photos){try{const data=await load(p.src);await new Promise((resolve,reject)=>{const test=new Image();test.onload=resolve;test.onerror=reject;test.src=data});loaded.push({...p,data})}catch(e){console.warn('photo skipped',p.src,e)}}
 grid.className='photo-slideshow';grid.innerHTML='<div class="slide-stage" aria-live="polite"></div><button class="slide-nav prev" type="button" aria-label="Previous photo">‹</button><button class="slide-nav next" type="button" aria-label="Next photo">›</button><div class="slide-dots" role="tablist"></div><div class="slide-caption"></div>';
 const stage=grid.querySelector('.slide-stage'),caption=grid.querySelector('.slide-caption'),dots=grid.querySelector('.slide-dots');let current=0,timer;
 const show=i=>{current=(i+loaded.length)%loaded.length;const p=loaded[current];stage.innerHTML='<img alt="'+p.alt+'" decoding="async">';stage.firstChild.src=p.data;caption.innerHTML='<strong>'+p.title+'</strong><span>'+p.text+'</span>';dots.querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===current));};
 const restart=()=>{clearInterval(timer);timer=setInterval(()=>show(current+1),5000)};dots.innerHTML=loaded.map((_,i)=>'<button type="button" aria-label="Go to photo '+(i+1)+'"></button>').join('');dots.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{show(i);restart()});grid.querySelector('.prev').onclick=()=>{show(current-1);restart()};grid.querySelector('.next').onclick=()=>{show(current+1);restart()};show(0);restart();
}
setTimeout(run,300);
})();
