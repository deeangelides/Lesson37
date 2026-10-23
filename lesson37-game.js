/* Lesson 37 — Silly Fill-in Stories: the game logic that lives inside the deck.
   Slides stay mounted (deck-stage hides, never unmounts), so one Word Collector slide updates in place. */
(function(){
const STORIES=[
{label:'Story One',title:'The Birthday Surprise',emoji:'🎂',img:'stickers/autumn/baking.png',
prompts:['a person’s name (a proper noun)','a colour (an adjective)','a plural noun (more than one thing)','an adjective (a describing word)','an animal','a verb (an action word)','an adverb (how? — often ends in -ly)','an interjection (Wow! Oh no!)','a preposition (under, through, beside…)','a comparative adjective (bigger, faster, sillier…)','a noun (a thing)','a plural noun','a past-tense verb (an action that already happened)','a body part (plural — e.g. ears)','an adjective'],
text:'Last Saturday was {1}’s birthday party, and it was going to be unforgettable. Everyone arrived wearing bright {2} party hats and carrying armfuls of {3}. The room looked wonderful — until a {4} {5} suddenly burst through the window and began to {6} {7} around the room! “{8}!” screamed Grandma, diving {9} the sofa. The birthday cake, which was {10} than a whole {11}, toppled over and splattered {12} everywhere. We all {13} so hard that our {14} ached. It was, without doubt, the most {15} birthday party in all of history!'},
{label:'Story Two',title:'The School Trip',emoji:'🚌',img:'stickers/school/school-bus.png',
prompts:['a place (a proper noun)','a number','a plural noun','an adjective','a food','a verb ending in -ing','an adverb','a sound word (onomatopoeia — bang, splash…)','a superlative adjective (biggest, silliest, most amazing…)','an animal (plural)','a preposition','an exclamation (a short sentence ending in !)','a past-tense verb','an adjective'],
text:'On Monday, our class went on a trip to {1}. We travelled for {2} hours on a bus packed with {3}. Our teacher, who was feeling very {4}, had packed a lunch of nothing but {5}. Halfway there, the bus started {6} {7} down the road. Then — {8}! — a tyre burst, and it was the {9} moment of the whole year. A herd of {10} wandered {11} the road and simply refused to move. “{12}” cried the driver. In the end, we {13} the rest of the way on foot. It was a truly {14} day out!'}];
const KEY='pd-lesson37-silly-v1';
const deck=document.querySelector('deck-stage');
const $=id=>document.getElementById(id);
let S={story:0,idx:0,words:STORIES.map(s=>s.prompts.map(()=>''))};
try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.words)){S.story=d.story===1?1:0;S.idx=d.idx|0;S.words=STORIES.map((s,i)=>s.prompts.map((_,j)=>(d.words[i]&&typeof d.words[i][j]==='string')?d.words[i][j]:''));}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
const cur=()=>STORIES[S.story],words=()=>S.words[S.story];
const filled=()=>words().filter(w=>w.trim()).length,complete=()=>filled()===cur().prompts.length;
const firstEmpty=()=>{const i=words().findIndex(w=>!w.trim());return i<0?0:i;};
/* navigation by slide id — indices are looked up live so rail edits never break the buttons */
function go(id){const s=$(id);if(!s||!deck.goTo)return;const i=Array.prototype.indexOf.call(deck.querySelectorAll(':scope > section'),s);if(i>=0)deck.goTo(i);}
/* ---- choose ---- */
function renderChoose(){document.querySelectorAll('.pick-card').forEach(card=>{const i=+card.dataset.story,st=STORIES[i],n=S.words[i].filter(w=>w.trim()).length,t=st.prompts.length;card.querySelector('.pk-c').textContent=st.emoji+' '+(n===0?t+' words to collect':n===t?'All '+t+' words collected ✓':n+' of '+t+' words collected');});}
document.querySelectorAll('.pick-card').forEach(card=>card.addEventListener('click',()=>{S.story=+card.dataset.story;if(complete()){save();go('s-story');return;}S.idx=firstEmpty();save();go('s-collect');}));
/* ---- word collector ---- */
const inp=$('wc-input');
function focusInput(){setTimeout(()=>{try{inp.focus({preventScroll:true});}catch(e){}},40);}
function renderCollect(){const st=cur(),n=st.prompts.length;S.idx=Math.max(0,Math.min(S.idx|0,n-1));
$('wc-story').textContent=st.emoji+' '+st.title;$('wc-count').textContent='Word '+(S.idx+1)+' of '+n;
const m=st.prompts[S.idx].match(/^(.*?)\s*(?:\((.*)\))?$/);$('wc-type').textContent=m[1];$('wc-hint').textContent=m[2]?'('+m[2]+')':'';
inp.value=words()[S.idx];inp.setAttribute('enterkeyhint',S.idx===n-1?'done':'next');$('wc-back').disabled=S.idx===0;updateNext();
const tr=$('wc-trail');tr.innerHTML='';st.prompts.forEach((p,i)=>{const li=document.createElement('li');const b=document.createElement('button');b.type='button';b.className='wc-dot'+(words()[i].trim()?' filled':'')+(i===S.idx?' cur':'');b.textContent=i+1;b.title='Word '+(i+1)+': '+p;b.setAttribute('aria-label',b.title+(words()[i].trim()?' — '+words()[i]:' (empty)'));b.addEventListener('click',()=>{S.idx=i;save();renderCollect();focusInput();});li.appendChild(b);tr.appendChild(li);});
const left=n-filled();$('wc-progress').textContent=left===0?'Every word is in — press Finish! 🎉':filled()+' of '+n+' words collected · '+left+' to go';}
function updateNext(){const b=$('wc-next'),has=!!inp.value.trim(),last=S.idx===cur().prompts.length-1;b.disabled=!has;b.textContent=last?'Finish! 🥁':'Next word →';}
inp.addEventListener('input',()=>{words()[S.idx]=inp.value;save();updateNext();const d=$('wc-trail').querySelectorAll('.wc-dot')[S.idx];if(d)d.classList.toggle('filled',!!inp.value.trim());});
inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();next();}});
function next(){if(!inp.value.trim())return;const n=cur().prompts.length;if(S.idx<n-1){S.idx++;save();renderCollect();focusInput();}else if(complete()){save();go('s-reveal');}else{S.idx=firstEmpty();save();renderCollect();focusInput();}}
$('wc-next').addEventListener('click',next);
$('wc-back').addEventListener('click',()=>{if(S.idx>0){S.idx--;save();renderCollect();focusInput();}});
/* ---- reveal (drum roll → ta-daa + confetti) ---- */
let revealTimer=0;
function enterReveal(){const r=$('s-reveal').querySelector('.slide');clearTimeout(revealTimer);if(!complete()){r.dataset.phase='locked';return;}r.dataset.phase='drum';revealTimer=setTimeout(()=>{r.dataset.phase='tada';confetti();},1700);}
$('rv-read').addEventListener('click',()=>go('s-story'));
$('rv-back').addEventListener('click',()=>{S.idx=firstEmpty();save();go('s-collect');});
$('st-back').addEventListener('click',()=>{S.idx=firstEmpty();save();go('s-collect');});
const cv=$('rv-confetti'),cx=cv.getContext('2d'),COLORS=['#FFF5CC','#FF931E','#8FD3F4','#84E6A4','#FFB8C6','#C2456A','#1E78B4','#FFD86B'];
let pieces=[],raf=0;
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const W=1920,H=1080;pieces=[];for(let i=0;i<220;i++){const a=-Math.PI/2+(Math.random()-.5)*1.6,sp=16+Math.random()*18;pieces.push({x:W/2+(Math.random()-.5)*W*.5,y:H*.78,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,w:12+Math.random()*12,h:9+Math.random()*14,r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,c:COLORS[i%COLORS.length],life:1,round:Math.random()<.3});}
cancelAnimationFrame(raf);const t0=performance.now();(function step(t){cx.clearRect(0,0,W,H);let alive=false;for(const p of pieces){p.vy+=.5;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;if(t-t0>2200)p.life-=.02;if(p.life<=0||p.y>H+60)continue;alive=true;cx.save();cx.globalAlpha=Math.max(0,p.life);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;if(p.round){cx.beginPath();cx.arc(0,0,p.w/2,0,7);cx.fill();}else cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore();}if(alive)raf=requestAnimationFrame(step);else cx.clearRect(0,0,W,H);})(t0);}
/* ---- the finished story ---- */
function enterStory(){const s=$('s-story').querySelector('.slide');if(!complete()){s.dataset.phase='locked';return;}s.dataset.phase='story';renderStory();fitStory();}
function renderStory(){const st=cur(),w=words();$('st-label').textContent='🎉 '+st.label+' · Read it aloud!';$('st-title').textContent=st.title;
const p=$('st-text');p.innerHTML='';const parts=st.text.split(/\{(\d+)\}/);let k=0;
parts.forEach((part,i)=>{if(i%2===0){p.appendChild(document.createTextNode(part));return;}const idx=+part-1;let word=w[idx].trim();const after=parts[i+1]||'';if(/^!/.test(after)&&/!$/.test(word))word=word.replace(/!+$/,'');
const b=document.createElement('button');b.type='button';b.className='st-w';b.style.setProperty('--i',k++);b.textContent=word;b.title=st.prompts[idx]+' — tap to change';b.addEventListener('click',()=>{S.idx=idx;save();go('s-collect');});p.appendChild(b);});}
function fitStory(){const card=$('s-story').querySelector('.st-card'),txt=$('st-text');let size=38;txt.style.fontSize=size+'px';while(size>24&&card.scrollHeight>card.clientHeight+2){size-=2;txt.style.fontSize=size+'px';}}
$('st-again').addEventListener('click',()=>{S.words[S.story]=cur().prompts.map(()=>'');S.idx=0;save();go('s-collect');});
$('st-switch').addEventListener('click',()=>go('s-choose'));
$('st-home').addEventListener('click',()=>go('s-title'));
/* ---- title / how to play ---- */
$('b-start').addEventListener('click',()=>go('s-howto'));
$('b-howto').addEventListener('click',()=>go('s-choose'));
/* ---- slide lifecycle ---- */
function onSlide(id,prevId){if(prevId==='s-collect')inp.blur();if(id==='s-collect'){renderCollect();focusInput();}else if(id==='s-reveal')enterReveal();else if(id==='s-story')enterStory();else if(id==='s-choose')renderChoose();}
deck.addEventListener('slidechange',e=>{const d=e.detail||{};onSlide(d.slide&&d.slide.id,d.previousSlide&&d.previousSlide.id);});
renderChoose();renderCollect();
const active=deck.querySelector(':scope > section[data-deck-active]');if(active)onSlide(active.id,null);
})();
