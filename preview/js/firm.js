(() => {
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let trigger;
 const open=(d,t)=>{trigger=t;d.showModal();document.body.style.overflow='hidden'};
 $$('dialog').forEach(d=>{d.addEventListener('close',()=>{document.body.style.overflow='';$('.menu-toggle').setAttribute('aria-expanded','false');trigger?.focus({preventScroll:true})});d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()})});
 $('.menu-toggle').addEventListener('click',e=>{open($('#mobile-menu'),e.currentTarget);e.currentTarget.setAttribute('aria-expanded','true')});
 $('[data-close-menu]').addEventListener('click',()=>$('#mobile-menu').close());
 $$('.dialog-close,.profile-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>$('#mobile-menu').close()));
 $$('a[href="#questions"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open($('#questions'),a)}));
 const profile=$('#profile-dialog'), original={name:$('#profile-name').textContent,sub:$('[data-paper="4GT-1"]').textContent,body:$('[data-paper="4GU-1"]').textContent,story:$('[data-paper="4GY-1"]').textContent};
 $$('[data-profile]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.profile==='duncan';$('[data-paper="4GY-1"]').textContent=d?original.story.replaceAll('Thad','Duncan'):original.story;$('#profile-name').textContent=d?'Duncan McMullin':original.name;$('[data-paper="4GT-1"]').textContent=d?'Attorney · Ennis, Montana · University of Montana, 2007':original.sub;$('[data-paper="4GU-1"]').textContent=d?'Duncan grew up in Ennis, Montana, and studied law at the University of Montana, graduating in 2007. He joined Bennett while studying law.':original.body;$('[data-paper="4GP-1"]').textContent=d?'Get in touch with Duncan':'Get in touch with Thad';const portrait=$('[data-paper="4GL-1"]');portrait.style.backgroundImage=getComputedStyle($(d?'[data-paper="4BI-1"]':'[data-paper="4AT-1"]')).backgroundImage;portrait.setAttribute('role','img');portrait.setAttribute('aria-label',d?'Duncan McMullin':'Thad Brinkman');open(profile,b)}));
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.35});$$('.license-card').forEach(c=>observer.observe(c));
 const video=$('.montana-film video'),button=$('.video-toggle');let pausedByUser=false;
 function load(){const source=video.querySelector('source');if(!source.src){source.src=source.dataset.src;video.load()}}
 async function play(){load();try{await video.play()}catch{button.textContent='Play film'}}
 video.addEventListener('play',()=>{button.textContent='Pause film';button.setAttribute('aria-label','Pause Montana film')});video.addEventListener('pause',()=>{button.textContent='Play film';button.setAttribute('aria-label','Play Montana film')});
 button.addEventListener('click',()=>{if(video.paused){pausedByUser=false;play()}else{pausedByUser=true;video.pause()}});
 new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!reduced.matches&&!navigator.connection?.saveData&&!pausedByUser)play();else video.pause()}),{threshold:.15}).observe(video);
})();
