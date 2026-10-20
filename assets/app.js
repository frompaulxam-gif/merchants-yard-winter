'use strict';
const $ = (q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
const nav=$('#site-menu'),detail=$('#detail-dialog'),trigger=$('.menu-trigger');
let lastFocus=null;
function closeDialog(d){if(d?.open)d.close();}
function openDialog(d){lastFocus=document.activeElement;d.showModal();document.body.style.overflow='hidden';}
for(const d of [nav,detail]){
 if(!d)continue;
 d.addEventListener('close',()=>{document.body.style.overflow='';trigger?.setAttribute('aria-expanded','false');if(lastFocus?.isConnected)lastFocus.focus();});
 d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();});
 $$('[data-close]',d).forEach(b=>b.addEventListener('click',()=>d.close()));
 d.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focus=$$('a[href],button:not([disabled]),input,select,textarea',d).filter(el=>el.getClientRects().length);if(!focus.length)return;const first=focus[0],last=focus.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
}
trigger?.addEventListener('click',()=>{openDialog(nav);trigger.setAttribute('aria-expanded','true');});
$$('a',nav||document.createElement('div')).forEach(a=>a.addEventListener('click',()=>closeDialog(nav)));
window.addEventListener('pageshow',()=>{closeDialog(nav);closeDialog(detail);document.body.style.overflow='';});
let previousWide=matchMedia('(min-width:901px)').matches;window.addEventListener('resize',()=>{const wide=matchMedia('(min-width:901px)').matches;if(wide!==previousWide)closeDialog(nav);previousWide=wide;});
// Old homepage fragments remain useful after moving the full sections to pages.
if(location.pathname==='/'){
 const map={about:'/visit/',reservations:'/book/',events:'/whats-on/',drinksmenu:'/menus/',cocktailmenu:'/cocktailmenu/',hire:'/private-hire/',faqs:'/visit/#faqs',signup:'/signup/',gallery:'/gallery/'};
 const dest=map[location.hash.slice(1).toLowerCase()];if(dest)location.replace(dest);
}
// Winter atmosphere: no pointer interception; persistent pause; offscreen pause.
const snow=$('.snow'),toggle=$('.motion-toggle'),motion=matchMedia('(prefers-reduced-motion:reduce)');
if(snow&&toggle){
 let paused=false;try{paused=localStorage.getItem('my-snow')==='off';}catch{}
 const seasonal=snow.dataset.winter==='true';let visible=true;
 for(let i=0;i<34;i++){const flake=document.createElement('i');flake.style.cssText=`--left:${(i*37.17)%100}%;--duration:${10+(i%9)}s;--delay:-${i%19}s;--opacity:${.2+(i%5)*.1};--drift:${(i%2?1:-1)*(25+i*3)}px;width:${2+i%4}px;height:${2+i%4}px;`;snow.append(flake);}
 function update(){const off=motion.matches||!seasonal;snow.classList.toggle('off',off);snow.classList.toggle('paused',paused||!visible||document.hidden);toggle.hidden=off;toggle.textContent=paused?'Play snow':'Pause snow';toggle.setAttribute('aria-pressed',String(paused));}
 toggle.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('my-snow',paused?'off':'on');}catch{}update();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:0}).observe($('.hero'));
 motion.addEventListener('change',update);document.addEventListener('visibilitychange',update);update();
}
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menuData=$('#menu-data');
if(menuData){
 const items=JSON.parse(menuData.textContent),byId=new Map(items.map(x=>[x.id,x]));let category='All';
 function filter(){const query=$('#menu-search').value.trim().toLocaleLowerCase();let count=0;$$('.menu-group').forEach(g=>{let shown=0;$$('.menu-item',g).forEach(b=>{const visible=(category==='All'||g.dataset.category===category)&&b.dataset.search.includes(query);b.hidden=!visible;if(visible){shown++;count++;}});g.hidden=!shown;});$('#menu-empty').hidden=count!==0;$('#menu-count').textContent=`${count} ${count===1?'drink':'drinks'}${category==='All'?'':` in ${category.toLowerCase()}`}`;}
 $$('[data-menu-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.menuFilter;$$('[data-menu-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();}));$('#menu-search').addEventListener('input',filter);
 $$('[data-item]').forEach(b=>b.addEventListener('click',()=>{const it=byId.get(b.dataset.item);$('#detail-content').innerHTML=`<div class="detail-inner"><img src="/assets/menu-table.webp" alt="Cocktail and Horsebox Bar menus on a candlelit table"><div class="detail-copy"><p class="eyebrow">${escapeHtml(it.category)}</p><h2 id="detail-title">${escapeHtml(it.name)}</h2><p class="detail-price">£${escapeHtml(it.price)}</p>${it.description?`<p>${escapeHtml(it.description)}</p>`:''}${it.note?`<p class="detail-note">${escapeHtml(it.note)}</p>`:''}<p class="detail-note">Please ask the team about ingredients and allergens before ordering.</p></div></div>`;openDialog(detail);}));filter();
}
// Compare ISO dates in the venue's timezone, not UTC or the visitor's timezone.
function venueToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
const today=venueToday();
if($('#event-month')){let category='All';function filterEvents(){const month=$('#event-month').value,showPast=$('#show-past').checked;let count=0;$$('.event-list-full .event-row').forEach(row=>{const ok=(category==='All'||row.dataset.category===category)&&(month==='all'||row.dataset.eventDate.startsWith(month))&&(showPast||row.dataset.eventDate>=today);row.hidden=!ok;if(ok)count++;});$('#event-count').textContent=`${count} ${count===1?'event':'events'}`;$('#events-empty').hidden=count!==0;}
 $$('[data-event-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.eventFilter;$$('[data-event-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filterEvents();}));$('#event-month').addEventListener('change',filterEvents);$('#show-past').addEventListener('change',filterEvents);filterEvents();}
$$('[data-ended-date]').forEach(el=>{if(el.dataset.endedDate<today){el.hidden=false;const action=$('[data-event-action-date]');if(action)action.innerHTML='<a class="button" href="/whats-on/">See upcoming events <span aria-hidden="true">↗</span></a>';}});
// Replace homepage upcoming rows from the same maintained event data when dates roll forward.
if($('[data-home-events]'))fetch('/assets/event-data.json').then(r=>r.ok?r.json():Promise.reject()).then(events=>{const future=events.filter(e=>e.date>=today).slice(0,3);const container=$('[data-home-events]');container.innerHTML=future.map(e=>{const d=new Date(e.date+'T12:00:00Z');return `<a class="event-row" href="/whats-on/${escapeHtml(e.slug)}/"><time datetime="${e.date}"><strong>${d.getUTCDate()}</strong><span>${d.toLocaleString('en-GB',{month:'short',timeZone:'Europe/London'})}</span></time><div class="event-row-text"><span class="event-type">${escapeHtml(e.category)} · ${escapeHtml(e.time)}</span><h3>${escapeHtml(e.title)}</h3></div><span class="row-arrow" aria-hidden="true">↗</span></a>`;}).join('')||'<p class="empty-state">New dates are on their way. <a href="/signup/">Stay in the loop</a> for the next programme.</p>';}).catch(()=>{});
$('#load-booking')?.addEventListener('click',e=>{const b=e.currentTarget,frame=document.createElement('iframe');frame.src=b.dataset.src;frame.title='Reserve a table at The Winter Tipi, Merchants Yard';frame.setAttribute('loading','eager');$('#booking-embed').replaceChildren(frame);b.textContent='Booking calendar opened';b.disabled=true;frame.addEventListener('load',()=>{$('#booking-embed').setAttribute('aria-label','ResDiary reservation calendar');});});
$('#hire-form')?.addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);const body=`Hello Merchants Yard,\n\nI'd like to enquire about private hire.\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPreferred date: ${data.get('date')}\nApproximate guests: ${data.get('guests')}\n\n${data.get('message')}\n\nThank you!`;location.href='mailto:merchantsyardlc@gmail.com?subject='+encodeURIComponent('Winter Tipi private hire enquiry')+'&body='+encodeURIComponent(body);$('#hire-status').textContent='Your email app should open with your enquiry. Review it there and press Send when ready. If it does not open, email merchantsyardlc@gmail.com directly.';});
$$('[data-photo]').forEach(b=>b.addEventListener('click',()=>{const image=$('img',b);$('#detail-content').innerHTML=`<div class="gallery-lightbox"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}"><p id="detail-title">${escapeHtml(image.alt)}</p></div>`;openDialog(detail);}));
