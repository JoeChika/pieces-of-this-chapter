const STORAGE_KEY='pieces-of-this-chapter-messages';
const seedMessages=[
 {name:'A Friend',relation:'Friend',message:'Here is to every lesson, every late night and every little victory. You did it — and this is only the beginning.',mood:'🎉',date:'20 Aug 2026'},
 {name:'Someone Who Believes In You',relation:'Loved one',message:'May the next chapter be even more beautiful than the one you are closing. Keep becoming.',mood:'🙏🏾',date:'20 Aug 2026'}
];

const $=s=>document.querySelector(s);
function getMessages(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(saved)?saved:seedMessages}catch{return seedMessages}}
function saveMessages(messages){localStorage.setItem(STORAGE_KEY,JSON.stringify(messages))}
function escapeHTML(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function render(){const wall=$('#memoryWall'),empty=$('#emptyState'),messages=getMessages();$('#messageCount').textContent=messages.length;if(!messages.length){wall.innerHTML='';empty.style.display='block';return}empty.style.display='none';wall.innerHTML=messages.map(m=>`<article class="memory-card"><div class="memory-top"><div><div class="memory-name">${escapeHTML(m.name)}</div><div class="memory-relation">${escapeHTML(m.relation)}</div></div><div class="memory-mood">${escapeHTML(m.mood||'💌')}</div></div><div class="memory-message">“${escapeHTML(m.message)}”</div><div class="memory-date">${escapeHTML(m.date)}</div></article>`).join('')}
function openQR(){const modal=$('#qrModal'),box=$('#qrcode');modal.classList.add('open');modal.setAttribute('aria-hidden','false');box.innerHTML='';new QRCode(box,{text:location.href.split('#')[0],width:190,height:190,colorDark:'#25221e',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});}
function closeQR(){$('#qrModal').classList.remove('open');$('#qrModal').setAttribute('aria-hidden','true')}

$('#guestForm').addEventListener('submit',e=>{e.preventDefault();const message={name:$('#guestName').value.trim(),relation:$('#guestRelation').value.trim(),message:$('#guestMessage').value.trim(),mood:$('#guestMood').value,date:new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date())};if(!message.name||!message.relation||!message.message)return;const messages=getMessages();messages.unshift(message);saveMessages(messages);render();e.target.reset();$('#wall-title').scrollIntoView({behavior:'smooth',block:'start'});});
['#openQrTop','#openQrHero','#openQrBottom'].forEach(id=>$(id).addEventListener('click',openQR));
$('#closeQr').addEventListener('click',closeQR);document.querySelector('[data-close-qr]').addEventListener('click',closeQR);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeQR()});
$('#copyLink').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href.split('#')[0]);$('#copyStatus').textContent='Link copied — share it with your people ✦'}catch{$('#copyStatus').textContent='Copy failed. You can copy the address from your browser.'}});
$('#clearDemo').addEventListener('click',()=>{if(confirm('Reset the local memory wall? This only affects this browser.')){localStorage.removeItem(STORAGE_KEY);render()}});
render();