(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px)');
  const clamp = x => Math.max(0, Math.min(1, x));
  const hero = $('.hero');
  function mobileLines(){ $$('.vehicle-line').forEach((n,i)=>{if(i%5===1)n.textContent=mobile.matches?'Motorhomes\n& RVs':'Motorhomes & RVs';}); }
  mobileLines();mobile.addEventListener('change',mobileLines);
  let paused = false;
  $('.motion-toggle').addEventListener('click', e => {
    paused = !paused; hero.classList.toggle('is-paused', paused);
    e.currentTarget.setAttribute('aria-pressed', String(paused));
    e.currentTarget.setAttribute('aria-label', paused ? 'Play vehicle animation' : 'Pause vehicle animation');
    e.currentTarget.textContent = paused ? '▷' : 'Ⅱ';
  });
  new IntersectionObserver(([entry]) => {
    $('.vehicle-track').style.animationPlayState = entry.isIntersecting && !paused ? 'running' : 'paused';
  }).observe(hero);

  // Native dialogs supply focus containment, Escape dismissal and focus restoration.
  let dialogTrigger = null;
  function openDialog(dialog, trigger) {
    dialogTrigger = trigger || document.activeElement;
    dialog.showModal(); document.body.style.overflow = 'hidden';
  }
  function closeDialog(dialog) { dialog.close(); }
  $$('dialog').forEach(d => {
    d.addEventListener('close', () => {
      document.body.style.overflow = '';
      $('.menu-toggle').setAttribute('aria-expanded', 'false');
      dialogTrigger?.focus({preventScroll:true});
    });
    d.addEventListener('click', e => { if (e.target === d) {
      const b=d.getBoundingClientRect();
      if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog(d);
    }});
  });
  $('.menu-toggle').addEventListener('click', e => {
    e.currentTarget.setAttribute('aria-expanded','true'); openDialog($('#mobile-menu'),e.currentTarget);
  });
  $('[data-close-menu]').addEventListener('click',()=>closeDialog($('#mobile-menu')));
  $$('.dialog-close').forEach(b=>b.addEventListener('click',()=>closeDialog(b.closest('dialog'))));
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>closeDialog($('#mobile-menu'))));
  $$('a[href="#questions"]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault(); if($('#mobile-menu').open)closeDialog($('#mobile-menu'));
    openDialog($('#questions'),a.closest('dialog')?$('.menu-toggle'):a);
  }));
  mobile.addEventListener('change',()=>{if(!mobile.matches && $('#mobile-menu').open)closeDialog($('#mobile-menu'));});

  const track=$('.cards-track'), progress=$('.cards-progress');
  function updateCards(){const max=track.scrollWidth-track.clientWidth;progress.style.width=`${(max ? .16+.84*track.scrollLeft/max : 1)*100}%`;}
  function nextCard(dir=1){const step=$('.situation-card').getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);const end=track.scrollLeft>=track.scrollWidth-track.clientWidth-3;track.scrollTo({left:dir>0&&end?0:track.scrollLeft+dir*step,behavior:reduced.matches?'instant':'smooth'});}
  $('.next-card').addEventListener('click',()=>nextCard());
  track.addEventListener('scroll',updateCards,{passive:true});
  track.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();nextCard(e.key==='ArrowRight'?1:-1);}});
  let drag=null;
  track.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0){drag={x:e.clientX,left:track.scrollLeft};track.classList.add('is-dragging');track.setPointerCapture(e.pointerId);}});
  track.addEventListener('pointermove',e=>{if(drag)track.scrollLeft=drag.left-(e.clientX-drag.x);});
  const endDrag=()=>{drag=null;track.classList.remove('is-dragging');};
  track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);
  // Consume vertical wheel gestures only inside the desktop rail, releasing at either end.
  track.addEventListener('wheel',e=>{if(!mobile.matches && Math.abs(e.deltaY)>Math.abs(e.deltaX)){const delta=e.deltaY*(e.deltaMode===1?16:1);const max=track.scrollWidth-track.clientWidth;if((delta>0&&track.scrollLeft<max-2)||(delta<0&&track.scrollLeft>2)){e.preventDefault();track.scrollLeft+=delta;}}},{passive:false});

  const original=getComputedStyle($('.gallery-image')).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
  const vehicles=[
    {name:'Cars',description:'Contemporary, classic, performance, and everyday vehicles.',src:original,alt:'Modern private car collection, BB Garage by Architects Ink'},
    {name:'Motorhomes & RVs',description:'Motorhomes and recreational vehicles, with ownership shaped around your plans.',src:'assets/img/camper-van.jpg',alt:'Camper van among trees'},
    {name:'Motorcycles',description:'The motorcycle you make time to ride.',src:'assets/img/royal-enfield.jpg',alt:'Royal Enfield motorcycle detail'},
    {name:'Boats & ATVs',description:'For the water, the trail, and what comes next.',src:'assets/round-two/boat-viktor.jpg',alt:'Yacht viewed from above'},
    {name:'Aircraft',description:'Personal attention to aircraft ownership and registration.',src:'assets/img/propeller-aircraft.jpg',alt:'Propeller aircraft outside a hangar'}
  ];
  let selected=0, generation=0;
  async function selectVehicle(i,focus=false){
    const v=vehicles[i],gen=++generation, image=new Image();image.src=v.src;
    try{await image.decode();}catch{return;}
    if(gen!==generation)return;
    selected=i;
    $('.gallery-image').style.backgroundImage=`url("${v.src}")`;
    $('.gallery-image').setAttribute('aria-label',v.alt);
    $('.gallery-photo').setAttribute('aria-label',`Enlarge ${v.name} photograph`);
    $('.gallery-tooltip').children[0].textContent=v.name;$('.gallery-tooltip').children[1].textContent=v.description;
    $$('.vehicle-tabs button').forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1;if(n===i&&focus)t.focus();});
  }
  $$('.vehicle-tabs button').forEach((t,i)=>{
    t.addEventListener('click',()=>selectVehicle(i));
    t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%vehicles.length;else if(e.key==='ArrowLeft')n=(i+vehicles.length-1)%vehicles.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=vehicles.length-1;if(n!==undefined){e.preventDefault();selectVehicle(n,true);}});
  });
  $('.gallery-photo').addEventListener('click',e=>{const v=vehicles[selected];$('#lightbox img').src=v.src;$('#lightbox img').alt=v.alt;$('.lightbox-caption').textContent=v.name;openDialog($('#lightbox'),e.currentTarget);});

  // Keep the original live letter accessible; three visual slices articulate its actual creases.
  const sheet=$('.letter-sheet'),stage=document.createElement('div');stage.className='letter-stage';sheet.before(stage);stage.append(sheet);
  const visual=document.createElement('div');visual.className='letter-visual';visual.setAttribute('aria-hidden','true');visual.inert=true;
  ['top','middle','bottom'].forEach(part=>{
    const clone=sheet.cloneNode(true);clone.classList.add('letter-piece','piece-'+part);clone.removeAttribute('id');
    $$('[id]',clone).forEach(n=>n.removeAttribute('id'));$$('a',clone).forEach(a=>{a.removeAttribute('href');a.tabIndex=-1;});visual.append(clone);
  });stage.append(visual);
  const top=$('.piece-top'),bottom=$('.piece-bottom');
  let scheduled=false;
  function draw(){
    scheduled=false;
    const u=innerWidth/1440;
    if(!mobile.matches&&!reduced.matches){
      const b=$('.montana').getBoundingClientRect();
      const stripe=clamp((innerHeight-b.top)/(b.height+innerHeight*.15));
      $('.center-stripes').style.clipPath=`inset(0 0 ${(1-stripe)*100}% 0)`;
      $$('.reveal-left,.reveal-right').forEach(el=>{
        // Source top positions give each column its own entrance, without moving the layout.
        const y=b.top+parseFloat(getComputedStyle(el).top);
        const p=clamp((innerHeight*.93-y)/(innerHeight*.33));
        el.style.opacity=String(p);el.style.transform=`translate3d(0,${(1-p)*48*u}px,0)`;
      });
      const r=stage.getBoundingClientRect();const p=clamp((innerHeight*.85-r.top)/(innerHeight*.65));
      const angle=(1-p)*12;
      top.style.transform=`rotateX(${-angle}deg)`;bottom.style.transform=`rotateX(${angle}deg)`;
      top.style.filter=`brightness(${1-(1-p)*.065})`;bottom.style.filter=`brightness(${1-(1-p)*.10})`;
      sheet.style.opacity=p>.995?'1':'0';visual.style.visibility=p>.995?'hidden':'visible';
    }else{sheet.style.opacity='1';visual.style.visibility='hidden';}
    updateCards();
  }
  function requestDraw(){if(!scheduled){scheduled=true;requestAnimationFrame(draw);}}
  addEventListener('scroll',requestDraw,{passive:true});addEventListener('resize',requestDraw);reduced.addEventListener('change',requestDraw);
  document.fonts.ready.then(requestDraw);draw();
})();
