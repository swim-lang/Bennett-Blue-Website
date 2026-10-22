(() => {
  const paints = [
    ['blue','Bennett Blue','Our house colour','#2C4A9B'],
    ['red','Rosso Corsa',"Italy’s racing red",'#C4141B'],
    ['green','British Racing Green',"Britain’s racing colour",'#0E3B2C'],
    ['plum','Plum Crazy','Mopar muscle, 1970','#4B2A69'],
    ['orange','Hugger Orange',"The ’69 Camaro",'#D9531E'],
    ['grey','Nardo Grey','Named for the Nardò test track','#6B6E70']
  ];
  const root=document.documentElement;
  let selected='blue';
  try { selected=localStorage.getItem('bennett-paint')||'blue'; } catch {}
  function apply(id){
    const paint=paints.find(p=>p[0]===id)||paints[0];
    selected=paint[0];root.style.setProperty('--color-blue',paint[3]);root.dataset.paint=selected;
  }
  apply(selected);
  document.addEventListener('DOMContentLoaded',()=>{
    const header=document.querySelector('.site-header');
    const wrap=document.createElement('div');wrap.className='paint-control';
    wrap.innerHTML='<button class="paint-trigger" aria-expanded="false" aria-controls="paint-panel" aria-label="Choose your paint">Paint</button><div id="paint-panel" class="paint-panel" hidden><h2>Choose your paint</h2><p>The site takes on the colour of your favourite car.</p><div class="paint-options" role="group" aria-label="Paint colours"></div></div>';
    const cta=header.querySelector('.header-cta'),actions=document.createElement('div');actions.className='header-actions';header.insertBefore(actions,cta);actions.append(wrap,cta);
    const trigger=wrap.querySelector('button'),panel=wrap.querySelector('.paint-panel'),options=wrap.querySelector('.paint-options');
    paints.forEach(([id,name,description,color])=>{
      const button=document.createElement('button');button.className='paint-option';button.type='button';button.dataset.paint=id;
      button.innerHTML=`<span class="paint-swatch" style="background-color:${color}" aria-hidden="true"></span><span class="paint-copy"><span>${name}</span><small>${description}</small></span><span class="paint-check" aria-hidden="true">✓</span>`;
      button.addEventListener('click',()=>{apply(id);try{localStorage.setItem('bennett-paint',id);}catch{}sync();close(true);});options.append(button);
    });
    function sync(){options.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paint===selected)));}
    function close(focus=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
    trigger.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)options.querySelector('[aria-pressed="true"]').focus();});
    document.addEventListener('pointerdown',e=>{if(!wrap.contains(e.target))close();});
    wrap.addEventListener('focusout',()=>{requestAnimationFrame(()=>{if(!wrap.contains(document.activeElement))close();});});
    wrap.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();close(true);}
      if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&!panel.hidden){e.preventDefault();const buttons=[...options.children],i=buttons.indexOf(document.activeElement);buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}
    });sync();
  });
})();
