(() => {
  const root=document.documentElement;
  if(!root.classList.contains('opening-pending'))return;
  const page=document.querySelector('#page'),hero=document.querySelector('.hero');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const overlay=document.createElement('div');overlay.className='opening-overlay';
  overlay.innerHTML='<div class="opening-band" aria-hidden="true"></div><div class="opening-seal" aria-hidden="true"></div>';
  document.body.append(overlay);
  const band=overlay.querySelector('.opening-band'),seal=overlay.querySelector('.opening-seal');
  let done=false,animations=[];
  const sound=new Audio('assets/audio/bennett-opening.mp3');
  sound.preload='auto';sound.volume=.65;
  let soundStarted=false,introStarted=false,soundFrame=0;
  const soundDeadline=()=>performance.now()-introStarted>650;
  function startSound(){
    // A blocked autoplay may retry on a gesture only near the start of the intro.
    if(done||!introStarted||soundStarted||soundDeadline()||document.hidden)return;
    soundStarted=true;
    sound.play().catch(()=>{soundStarted=false;});
  }
  function stopSound(){cancelAnimationFrame(soundFrame);sound.pause();sound.currentTime=0;}
  function fadeSound(){
    if(done)return;
    if(sound.currentTime>1.7)sound.volume=.65*Math.max(0,(2-sound.currentTime)/.3);
    soundFrame=requestAnimationFrame(fadeSound);
  }
  function visibility(){if(document.hidden)finish();}
  addEventListener('pointerdown',startSound);addEventListener('keydown',startSound);
  document.addEventListener('visibilitychange',visibility);
  const oldOverflow=document.body.style.overflow;
  const oldInert=page.inert;
  function finish(){
    if(done)return;done=true;
    stopSound();
    removeEventListener('pointerdown',startSound);removeEventListener('keydown',startSound);
    document.removeEventListener('visibilitychange',visibility);
    animations.forEach(a=>a.cancel());overlay.remove();page.inert=oldInert;document.body.style.overflow=oldOverflow;
    root.classList.remove('opening-pending');
    removeEventListener('keydown',escape);removeEventListener('resize',finish);reduced.removeEventListener('change',finish);
  }
  function escape(e){if(e.key==='Escape')finish();}
  addEventListener('keydown',escape);addEventListener('resize',finish);reduced.addEventListener('change',finish);
  setTimeout(finish,4500); // Always release the page, even if a font or animation fails.
  async function play(){
    await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,500))]);
    if(done)return;
    if(reduced.matches||scrollY>40){finish();return;}
    introStarted=performance.now();startSound();fadeSound();
    page.inert=true;document.body.style.overflow='hidden';
    const target=document.querySelector('.hero-seal'),box=target.getBoundingClientRect();
    const graphic=target.querySelector('svg').cloneNode(true);graphic.removeAttribute('id');graphic.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));seal.append(graphic);
    Object.assign(seal.style,{left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`});
    const bandHeight=Math.max(box.height*1.48,innerHeight*56/240),bandTop=box.top+box.height/2-bandHeight/2;
    Object.assign(band.style,{top:`${bandTop}px`,height:`${bandHeight}px`});
    const animate=(node,frames,options)=>{const a=node.animate(frames,{fill:'both',...options});animations.push(a);return a;};
    animate(band,[{transform:'translateX(-101%)'},{transform:'translateX(0)'}],{delay:300,duration:400,easing:'cubic-bezier(.22,.7,.3,1)'});
    animate(seal,[{opacity:0,transform:'scale(1.12)'},{opacity:1,transform:'scale(1)'}],{delay:700,duration:400,easing:'cubic-bezier(.16,1,.3,1)'});
    animate(band,[{top:`${bandTop}px`,height:`${bandHeight}px`,boxShadow:'0 3px 6px #1616162e'},{top:'0px',height:`${innerHeight}px`,boxShadow:'0 0 0 #16161600'}],{delay:1100,duration:500,easing:'cubic-bezier(.65,0,.35,1)'});
    // Reveal the real seal at the identical position; keep the overlay until the band fills.
    const handoff=setTimeout(()=>{if(!done){overlay.style.background='none';band.style.visibility='hidden';seal.style.visibility='hidden';target.style.opacity='1';}},1600);
    document.querySelectorAll('.vehicle-line').forEach((line,i)=>{
      animate(line,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{delay:1600+(i%5)*65,duration:420,easing:'cubic-bezier(.22,.7,.3,1)'});
    });
    animate(document.querySelector('.hero-below'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{delay:1800,duration:400,easing:'ease-out'});
    const end=animate(document.querySelector('.site-header'),[{opacity:0},{opacity:1}],{delay:1900,duration:400,easing:'ease-out'});
    try{await end.finished;}catch{}finally{clearTimeout(handoff);target.style.removeProperty('opacity');finish();}
  }
  play().catch(finish);
})();
