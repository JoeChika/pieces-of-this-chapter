(()=>{
const VERSION='20260823-photo-final-2';
const photos=[
 {src:'/images/paragon-pink.b64',alt:"Victory at Paragon '24",title:"Paragon '24.",text:'The chapter we prayed, studied and worked our way through.'},
 {src:'/images/portrait-current.b64',alt:'Victory, still becoming',title:'And here I am.',text:'Still becoming. Still grateful. Still carrying every piece.'},
 {src:'/images/paragon-coat.jpg',alt:'Victory in her lab coat',title:'Becoming the pharmacist.',text:'A dream, a white coat, and a chapter worth every late night.'},
 {src:'/images/jersey.jpg',alt:'Victory in her jersey',title:'Finding my rhythm.',text:'Learning, growing, laughing, and making memories along the way.'},
 {src:'/images/slide-02.b64',alt:'Victory in her Paragon outfit',title:'Standing in my own story.',text:'Different seasons, different versions of me — all part of the becoming.'},
 {src:'/images/slide-03.b64',alt:'Victory in her full Paragon outfit',title:'A little joy along the way.',text:'Because the journey deserved moments of celebration too.'},
 {src:'/images/slide-05.b64',alt:'Victory with four friends in the graduation collage',title:'The people who made it sweeter.',text:'Some memories are better when they are shared.'},
 {src:'/images/kiss.b64',alt:'Victory blowing a kiss',title:'And a little kiss goodbye. 💋',text:'Grateful for the journey. It wasn’t easy, but God was faithful through it all.'}
];
async function load(src){
 const r=await fetch(src+'?v='+VERSION,{cache:'no-store'});if(!r.ok)throw Error(src);
 const bytes=new Uint8Array(await r.arrayBuffer());if(!bytes.length)throw Error(src);
 if(src.endsWith('.b64')){
   const text=new TextDecoder().decode(bytes).replace(/\s/g,'');
   atob(text);
   return 'data:image/jpeg;base64,'+text;
 }
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 let mime='image/jpeg';if(bytes[0]===60)mime='image/svg+xml';else if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)mime='image/png';
 return 'data:'+mime+';base64,'+btoa(binary);
}
async function run(){
 const grid=document.querySelector('.photo-grid');if(!grid)return;const loaded=[];
 for(const p of photos){try{loaded.push({...p,data:await load(p.src)})}catch(e){console.warn('photo repair skipped',p.src,e)}}
 if(!loaded.length)return;
 grid.className='photo-slideshow';grid.innerHTML='<div class="slide-stage" aria-live="polite"></div><button class="slide-nav prev" type="button" aria-label="Previous photo">‹</button><button class="slide-nav next" type="button" aria-label="Next photo">›</button><div class="slide-dots" role="tablist"></div><div class="slide-caption"></div>';
 const stage=grid.querySelector('.slide-stage'),caption=grid.querySelector('.slide-caption'),dots=grid.querySelector('.slide-dots');let current=0,timer;
 const show=i=>{current=(i+loaded.length)%loaded.length;const p=loaded[current];stage.innerHTML='<img alt="'+p.alt+'" decoding="async">';stage.firstChild.src=p.data;caption.innerHTML='<strong>'+p.title+'</strong><span>'+p.text+'</span>';dots.querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===current))};
 const restart=()=>{clearInterval(timer);timer=setInterval(()=>show(current+1),5000)};
 dots.innerHTML=loaded.map((_,i)=>'<button type="button" aria-label="Go to photo '+(i+1)+'"></button>').join('');dots.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{show(i);restart()});grid.querySelector('.prev').onclick=()=>{show(current-1);restart()};grid.querySelector('.next').onclick=()=>{show(current+1);restart()};show(0);restart();
 const hero=document.querySelector('.hero-card .polaroid img');if(hero){try{hero.src=await load('/images/paragon-pink.b64')}catch(e){console.warn('hero image repair failed',e)}}
}
setTimeout(run,300);
})();