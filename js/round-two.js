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
  $('.motion-toggle').hidden = true;
  const montana=$('.montana'), scrollStage=document.createElement('div');
  scrollStage.className='montana-stage';montana.before(scrollStage);scrollStage.append(montana);
  $('.company-address')?.remove();
  for(const side of ['left','right']){
    const column=document.createElement('div');column.className='montana-column column-'+side;
    const order=side==='left'?['adv-title','adv-intro','adv-link']:['office','company-title','company-body','company-cta'];
    order.forEach(name=>column.append($('.'+name)));montana.append(column);
  }

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

  // Situations P: all six original situations in one focused, user-controlled carousel.
  const situations=$('.situations');
  const situationData=$$('.situation-card').map(card=>({
    title:$('h3',card).textContent.trim(),
    body:$('h3',card).nextElementSibling.textContent.trim()
  }));
  const situationHeading='How we can help.';
  situations.replaceChildren();situations.classList.add('spotlight');
  const spotlightTitle=document.createElement('h2');spotlightTitle.textContent=situationHeading;spotlightTitle.id='spotlight-title';situations.append(spotlightTitle);
  situations.setAttribute('aria-labelledby','spotlight-title');situations.setAttribute('aria-roledescription','carousel');
  const viewport=document.createElement('div');viewport.className='spotlight-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Situations. Use left and right arrow keys to browse.');
  viewport.innerHTML='<button class="spotlight-preview spotlight-previous" type="button"><span class="situation-oval"></span><span class="preview-title"></span></button><article class="spotlight-current" aria-live="polite" aria-atomic="true"><span class="situation-oval" aria-hidden="true"></span><h3></h3><p></p></article><button class="spotlight-preview spotlight-next" type="button"><span class="situation-oval"></span><span class="preview-title"></span></button>';
  situations.append(viewport);
  const controls=document.createElement('nav');controls.className='spotlight-controls';controls.setAttribute('aria-label','Choose a situation');
  controls.innerHTML='<button type="button" class="spotlight-arrow previous" aria-label="Previous situation">←</button>'+situationData.map((v,i)=>`<button type="button" class="situation-dot" aria-label="Situation ${i+1}"><span class="situation-oval">${i+1}</span></button>`).join('')+'<button type="button" class="spotlight-arrow next" aria-label="Next situation">→</button>';
  situations.append(controls);
  let situationIndex=0;
  function showSituation(index,animate=true,direction=1){
    const next=(index+situationData.length)%situationData.length;
    if(animate&&next===situationIndex)return;
    let outgoing;
    if(animate&&!reduced.matches){
      viewport.querySelectorAll('.spotlight-outgoing').forEach(n=>n.remove());
      outgoing=document.createElement('div');outgoing.className='spotlight-outgoing';outgoing.setAttribute('aria-hidden','true');outgoing.inert=true;
      [...viewport.children].forEach(n=>{const copy=n.cloneNode(true);copy.removeAttribute('aria-live');copy.querySelectorAll('[aria-live]').forEach(el=>el.removeAttribute('aria-live'));outgoing.append(copy);});
    }
    situationIndex=next;
    const current=situationData[situationIndex], panel=$('.spotlight-current');
    $('.situation-oval',panel).textContent=situationIndex+1;$('h3',panel).textContent=current.title;$('p',panel).textContent=current.body;
    for(const [selector,step] of [['.spotlight-previous',-1],['.spotlight-next',1]]){
      const button=$(selector),n=(situationIndex+step+situationData.length)%situationData.length;
      $('.situation-oval',button).textContent=n+1;$('.preview-title',button).textContent=situationData[n].title;button.setAttribute('aria-label',`View situation ${n+1}: ${situationData[n].title}`);
    }
    $$('.situation-dot').forEach((button,i)=>{button.setAttribute('aria-current',String(i===situationIndex));button.setAttribute('aria-label',`Situation ${i+1}: ${situationData[i].title}`);});
    if(animate&&!reduced.matches){
      if(outgoing){
        viewport.append(outgoing);
        outgoing.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*32}px)`}],{duration:600,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished.then(()=>outgoing.remove()).catch(()=>outgoing.remove());
      }
      [panel,...$$('.spotlight-preview',viewport)].filter(n=>!n.closest('.spotlight-outgoing')).forEach(n=>{
        n.getAnimations().forEach(a=>a.cancel());
        const opacity=n.classList.contains('spotlight-preview')?.5:1;
        n.animate([{opacity:0,transform:`translateX(${direction*32}px)`},{opacity,transform:'translateX(0)'}],{duration:850,easing:'cubic-bezier(.22,.7,.3,1)'});
      });
    }
  }
  $('.spotlight-previous').addEventListener('click',()=>showSituation(situationIndex-1,true,-1));
  $('.spotlight-next').addEventListener('click',()=>showSituation(situationIndex+1));
  $('.spotlight-arrow.previous').addEventListener('click',()=>showSituation(situationIndex-1,true,-1));
  $('.spotlight-arrow.next').addEventListener('click',()=>showSituation(situationIndex+1));
  $$('.situation-dot').forEach((b,i)=>b.addEventListener('click',()=>showSituation(i,true,i<situationIndex?-1:1)));
  viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const d=e.key==='ArrowLeft'?-1:1;showSituation(situationIndex+d,true,d);}});
  let swipeStart;
  viewport.addEventListener('pointerdown',e=>{swipeStart={x:e.clientX,y:e.clientY};});
  viewport.addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){const d=dx<0?1:-1;showSituation(situationIndex+d,true,d);}});
  viewport.addEventListener('pointercancel',()=>{swipeStart=null;});
  showSituation(0,false);
  function sizeSpotlight(){
    const panel=$('.spotlight-current'),probe=panel.cloneNode(true);
    probe.classList.add('spotlight-measure');probe.setAttribute('aria-hidden','true');probe.removeAttribute('aria-live');probe.inert=true;
    viewport.append(probe);const title=$('h3',probe),body=$('p',probe);title.style.minHeight='0';body.style.minHeight='0';
    let titleHeight=0,bodyHeight=0;
    situationData.forEach(v=>{title.textContent=v.title;body.textContent=v.body;titleHeight=Math.max(titleHeight,title.offsetHeight);bodyHeight=Math.max(bodyHeight,body.offsetHeight);});
    $('h3',panel).style.minHeight=titleHeight+'px';$('p',panel).style.minHeight=bodyHeight+'px';probe.remove();
  }
  document.fonts.ready.then(sizeSpotlight);addEventListener('resize',sizeSpotlight);
  // B2's edge geometry, kept separate from the pinned Montana content.
  [scrollStage,situations,$('.vehicles'),$('.firm'),$('.contact')].forEach(section=>{
    const edge=document.createElementNS('http://www.w3.org/2000/svg','svg');edge.classList.add('section-oval-edge');edge.setAttribute('viewBox','0 0 1440 72');edge.setAttribute('preserveAspectRatio','none');edge.setAttribute('aria-hidden','true');
    edge.innerHTML='<path d="M0 65.25 A720 64 0 0 1 1440 65.25" fill="none" stroke="#161616" stroke-width="2.5"/>';section.append(edge);
  });

  // Vehicles C: retain the existing gallery controls inside the approved Paper frame.
  const gallery=$('.vehicles'),frame=document.createElement('div');frame.className='gallery-frame';
  $('.gallery-photo').before(frame);frame.append($('.gallery-photo'),$('.gallery-tooltip'));
  $('.gallery-intro').hidden=true;
  const diagonal=document.createElementNS('http://www.w3.org/2000/svg','svg');
  diagonal.classList.add('gallery-diagonal');diagonal.setAttribute('viewBox','0 0 1440 1500');diagonal.setAttribute('aria-hidden','true');
  for(let i=0;i<4;i++){
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M${436+i*18} 1500L${1302+i*18} 0`);path.setAttribute('pathLength','1');diagonal.append(path);
  }
  gallery.prepend(diagonal);
  const galleryObserver=new IntersectionObserver(entries=>{
    if(entries.some(e=>e.isIntersecting)){gallery.classList.add('diagonal-revealed');galleryObserver.disconnect();}
  },{threshold:0,rootMargin:'0px 0px -38% 0px'});galleryObserver.observe($('.gallery-frame'));

  const original=getComputedStyle($('.gallery-image')).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
  const vehicles=[
    {name:'Cars',description:'Contemporary, classic, performance, and everyday vehicles.',src:original,alt:'Modern private car collection, BB Garage by Architects Ink'},
    {name:'Motorhomes & RVs',description:'Motorhomes and recreational vehicles, with ownership shaped around your plans.',src:'assets/round-two/van-daniel-j-schwarz.jpg',alt:'Camper van on a mountain track amid golden grass'},
    {name:'Motorcycles',description:'The motorcycle you make time to ride.',src:'assets/round-two/motorcycle-O6M6TeMbEqE.jpg',alt:'Motorcycle parked beside a road'},
    {name:'Boats & ATVs',description:'For the water, the trail, and what comes next.',src:'assets/round-two/boat-viktor.jpg',alt:'Yacht viewed from above'},
    {name:'Aircraft',description:'Personal attention to aircraft ownership and registration.',src:'assets/round-two/jet-xGBGYBckZcE.jpg',alt:'White jet parked at an airport'}
  ];
  // Fetch and decode once, before the visitor reaches the category controls.
  const vehicleImages=vehicles.map(v=>{
    const image=new Image();image.src=v.src;
    return {image,ready:image.decode().then(()=>true,()=>false)};
  });
  let selected=0, generation=0;
  async function selectVehicle(i,focus=false){
    const v=vehicles[i],gen=++generation;
    if(focus)$$('.vehicle-tabs button')[i].focus();
    if(!await vehicleImages[i].ready || gen!==generation)return;
    if(i===selected)return;
    selected=i;
    const picture=$('.gallery-image');
    picture.getAnimations().forEach(a=>a.cancel());
    if(!reduced.matches){
      const outgoing=picture.cloneNode(false);outgoing.classList.add('gallery-outgoing');
      outgoing.removeAttribute('role');outgoing.removeAttribute('aria-label');outgoing.setAttribute('aria-hidden','true');
      $$('.gallery-outgoing').forEach(n=>n.remove());picture.after(outgoing);
      outgoing.animate([{opacity:1},{opacity:0}],{duration:450,easing:'ease-out',fill:'forwards'}).finished.then(()=>outgoing.remove()).catch(()=>outgoing.remove());
      picture.animate([{transform:'scale(1.035)'},{transform:'scale(1)'}],{duration:1100,easing:'cubic-bezier(.2,.65,.3,1)'});
      $('.gallery-tooltip').getAnimations().forEach(a=>a.cancel());
      $('.gallery-tooltip').animate([{opacity:.35},{opacity:1}],{duration:550,easing:'ease-out'});
    }
    picture.style.backgroundImage=`url("${v.src}")`;
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

  // One live, readable letter settles like stationery placed on a desk.
  const sheet=$('.letter-sheet'),stage=document.createElement('div');stage.className='letter-stage';sheet.before(stage);stage.append(sheet);
  let letterEntrance;
  const letterObserver=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting))return;
    letterObserver.disconnect();
    if(reduced.matches)return;
    letterEntrance=sheet.animate([
      {transform:`translate3d(0,${mobile.matches?100:210}px,0) rotate(5.5deg)`},
      {transform:'translate3d(0,0,0) rotate(0deg)'}
    ],{duration:2400,easing:'cubic-bezier(.22,.65,.3,1)'});
  },{threshold:0,rootMargin:'0px 0px -38% 0px'});
  letterObserver.observe(stage);
  reduced.addEventListener('change',()=>{if(reduced.matches)letterEntrance?.cancel();});
  let scheduled=false;
  function draw(){
    scheduled=false;
    const u=innerWidth/1440;
    if(!mobile.matches&&!reduced.matches){
      const heroBox=hero.getBoundingClientRect();
      $('.vehicle-track').style.transform=`translate3d(0,${-clamp(-heroBox.top/heroBox.height)*parseFloat(getComputedStyle($('.vehicle-line')).height)*1.3}px,0)`;
      const b=scrollStage.getBoundingClientRect();
      const sequence=clamp(-b.top/(b.height-innerHeight));
      $('.center-stripes').style.clipPath=`inset(0 0 ${(1-clamp((sequence-.08)/.38))*100}% 0)`;
      for(const side of ['left','right']){
        const t=clamp((sequence-(side==='left'?.16:.53))/.26), column=$('.column-'+side);
        // Travel from below the viewport at full opacity, then hold the shared title line.
        const officeClearance=side==='right'?$('.office').offsetHeight+32:0;
        const travel=innerHeight-column.offsetTop+officeClearance+2;
        column.style.opacity='1';
        column.style.transform=`translate3d(0,${(1-t)*travel}px,0)`;
      }
    }else{$('.vehicle-track').style.transform='none';$$('.montana-column').forEach(n=>{n.style.opacity='1';n.style.transform='none';});$('.center-stripes').style.clipPath='none';}

  }
  function requestDraw(){if(!scheduled){scheduled=true;requestAnimationFrame(draw);}}
  addEventListener('scroll',requestDraw,{passive:true});addEventListener('resize',requestDraw);reduced.addEventListener('change',requestDraw);
  document.fonts.ready.then(requestDraw);draw();
})();
