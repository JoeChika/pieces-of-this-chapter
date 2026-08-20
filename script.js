const STORAGE_KEY='pieces-of-this-chapter-messages';
const seedMessages=[
 {name:'A Friend',relation:'Friend',message:'Here is to every lesson, every late night and every little victory. You did it — and this is only the beginning.',mood:'🎉',date:'20 Aug 2026'},
 {name:'Someone Who Believes In You',relation:'Loved one',message:'May the next chapter be even more beautiful than the one you are closing. Keep becoming.',mood:'🙏🏾',date:'20 Aug 2026'}
];
const $=s=>document.querySelector(s);
let sharedMessages=null;
function localMessages(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(saved)?saved:seedMessages}catch{return seedMessages}}
function saveLocal(messages){localStorage.setItem(STORAGE_KEY,JSON.stringify(messages))}
function escapeHTML(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function render(messages){const wall=$('#memoryWall'),empty=$('#emptyState');$('#messageCount').textContent=messages.length;if(!messages.length){wall.innerHTML='';empty.style.display='block';return}empty.style.display='none';wall.innerHTML=messages.map(m=>`<article class="memory-card"><div class="memory-top"><div><div class="memory-name">${escapeHTML(m.name)}</div><div class="memory-relation">${escapeHTML(m.relation)}</div></div><div class="memory-mood">${escapeHTML(m.mood||'💌')}</div></div><div class="memory-message">“${escapeHTML(m.message)}”</div><div class="memory-date">${escapeHTML(m.date)}</div></article>`).join('')}
async function loadMessages(){try{const response=await fetch('/api/messages',{cache:'no-store'});if(!response.ok)throw new Error('API unavailable');sharedMessages=await response.json();render(sharedMessages)}catch{sharedMessages=null;render(localMessages())}}
async function addMessage(message){try{const response=await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(message)});if(!response.ok)throw new Error('API unavailable');const saved=await response.json();sharedMessages=sharedMessages||[];sharedMessages.unshift(saved);render(sharedMessages);return true}catch{const messages=localMessages();messages.unshift(message);saveLocal(messages);render(messages);return false}}
function openQR(){const modal=$('#qrModal'),box=$('#qrcode');modal.classList.add('open');modal.setAttribute('aria-hidden','false');box.innerHTML='';new QRCode(box,{text:location.href.split('#')[0],width:190,height:190,colorDark:'#25221e',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H})}
function closeQR(){$('#qrModal').classList.remove('open');$('#qrModal').setAttribute('aria-hidden','true')}
$('#guestForm').addEventListener('submit',async e=>{e.preventDefault();const message={name:$('#guestName').value.trim(),relation:$('#guestRelation').value.trim(),message:$('#guestMessage').value.trim(),mood:$('#guestMood').value};if(!message.name||!message.relation||!message.message)return;const shared=await addMessage(message);e.target.reset();$('#wall-title').scrollIntoView({behavior:'smooth',block:'start'});if(!shared)alert('Your message was saved on this device. Shared guestbook storage is being connected.')});
['#openQrTop','#openQrHero','#openQrBottom'].forEach(id=>$(id).addEventListener('click',openQR));
$('#closeQr').addEventListener('click',closeQR);document.querySelector('[data-close-qr]').addEventListener('click',closeQR);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeQR()});
$('#copyLink').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href.split('#')[0]);$('#copyStatus').textContent='Link copied — share it with your people ✦'}catch{$('#copyStatus').textContent='Copy failed. You can copy the address from your browser.'}});
$('#clearDemo').addEventListener('click',()=>{if(confirm('Reset the local demo wall? This only affects this browser.')){localStorage.removeItem(STORAGE_KEY);sharedMessages=null;render(localMessages())}});
loadMessages();