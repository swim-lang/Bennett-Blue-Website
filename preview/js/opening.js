(() => {
  const root=document.documentElement;
  if(!root.classList.contains('opening-pending'))return;
  const page=document.querySelector('#page'),hero=document.querySelector('.hero');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const overlay=document.createElement('div');overlay.className='opening-overlay';
  overlay.innerHTML='<div class="opening-shutter opening-top"></div><div class="opening-shutter opening-bottom"></div><div class="opening-rules"><i></i><i></i><i></i><i></i></div><div class="opening-seal"></div>';
  overlay.setAttribute('aria-hidden','true');
  document.body.append(overlay);
  const seal=overlay.querySelector('.opening-seal');
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
    const width=Math.min(190,innerWidth*.34),height=width*box.height/box.width;
    Object.assign(seal.style,{left:`${(innerWidth-width)/2}px`,top:`${(innerHeight-height)/2}px`,width:`${width}px`,height:`${height}px`});
    const animate=(node,frames,options)=>{const a=node.animate(frames,{fill:'both',...options});animations.push(a);return a;};
    const ease='cubic-bezier(.65,0,.25,1)';
    animate(seal,[{opacity:0,transform:'scale(.94)'},{opacity:1,transform:'scale(1)'}],{delay:100,duration:650,easing:'cubic-bezier(.16,1,.3,1)'});
    overlay.querySelectorAll('.opening-rules i').forEach((line,i)=>{
      animate(line,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{delay:300+i*80,duration:1000,easing:ease});
    });
    // The pinstripes become the opening seam; two paper panels part vertically.
    animate(overlay.querySelector('.opening-top'),[{transform:'translateY(0)'},{transform:'translateY(-101%)'}],{delay:1550,duration:1350,easing:ease});
    animate(overlay.querySelector('.opening-bottom'),[{transform:'translateY(0)'},{transform:'translateY(101%)'}],{delay:1550,duration:1350,easing:ease});
    animate(overlay.querySelector('.opening-rules'),[{opacity:1},{opacity:0}],{delay:1550,duration:400,easing:'ease-out'});
    animate(seal,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${box.left+box.width/2-innerWidth/2}px,${box.top+box.height/2-innerHeight/2}px) scale(${box.width/width})`,opacity:1}],{delay:1550,duration:1350,easing:ease});
    document.querySelectorAll('.vehicle-line').forEach((line,i)=>{
      animate(line,[{opacity:1,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{delay:1750+(i%5)*65,duration:700,easing:'ease-out'});
    });
    animate(document.querySelector('.hero-below'),[{opacity:0},{opacity:1}],{delay:2100,duration:700,easing:'ease-out'});
    const end=animate(document.querySelector('.site-header'),[{opacity:0},{opacity:1}],{delay:2200,duration:700,easing:'ease-out'});
    try{await end.finished;}catch{}finally{finish();}
  }
  play().catch(finish);
})();
