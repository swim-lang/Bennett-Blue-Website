from pathlib import Path
import re, json, html, shutil, urllib.request
from bs4 import BeautifulSoup

BASE=Path(__file__).resolve().parents[1]
OUT=BASE
CSS=[]
def convert(name):
    source=(BASE/'design-source'/f'{name}.jsx').read_text().strip()[1:-1]
    def style(m):
        pairs=re.findall(r"(\w+):\s*('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"|-?[\d.]+)",m.group(1))
        rules=[]
        for key,val in pairs:
            prop=re.sub(r'[A-Z]',lambda x:'-'+x[0].lower(),key)
            if key.startswith(('Webkit','Moz')):prop='-'+prop.lstrip('-')
            value=val[1:-1] if val[0] in '\"\'' else val
            value=value.replace('\\\"','\"')
            if val[0] not in '\"\'' and prop not in ['font-weight','opacity','flex-grow','flex-shrink','order','z-index']:value+='px'
            rules.append(prop+':'+value)
        return 'style="'+html.escape(';'.join(rules),quote=True)+'"'
    source=re.sub(r'style=\{\{(.*?)\}\}',style,source,flags=re.S)
    source=re.sub(r'(\w+)=\{([^{}]+)\}',r'\1="\2"',source)
    for a,b in {'className':'class','strokeWidth':'stroke-width','fillRule':'fill-rule','clipRule':'clip-rule','strokeLinecap':'stroke-linecap','strokeLinejoin':'stroke-linejoin','fillOpacity':'fill-opacity','strokeOpacity':'stroke-opacity','stopColor':'stop-color','stopOpacity':'stop-opacity'}.items():source=source.replace(a+'=',b+'=')
    source=re.sub(r'<div([^>]*?)/>',r'<div\1></div>',source)
    soup=BeautifulSoup(source,'html.parser')
    for text in soup.find_all(string=True):
        if text.strip():text.replace_with(text.strip())
        else:text.extract()
    for el in soup.select('[style]'):
        raw=el['style']
        # Desktop is the exact 1440px Paper geometry, scaled fluidly as a unit.
        scaled=re.sub(r'(-?\d+(?:\.\d+)?)px',r'calc(\1 * var(--u))',raw)
        cls='p'+str(len(CSS)); CSS.append('.'+cls+'{'+scaled+'}')
        el['class']=el.get('class',[])+[cls]; del el['style']
    return soup

def children(n):return n.find_all(recursive=False)
def cls(n,v):n['class']=n.get('class',[])+v.split();return n
def fragment(s):return BeautifulSoup(s,'html.parser')
def link(n,href):n.name='a';n['href']=href;return n

doc=convert('18V-0'); root=doc.find('div');root['id']='page';cls(root,'page')
hero,adv,cards,gallery,firm,footer=children(root)
for el,name in zip([hero,adv,cards,gallery,firm,footer],['hero','montana','situations','vehicles','firm','contact']):
    el.name='section' if name!='contact' else 'footer';el['id']=name;cls(el,name)
header,billboard,below=children(hero);header.name='header';cls(header,'site-header');cls(billboard,'billboard');cls(below,'hero-below')
logo,nav,cta=children(header);nav.name='nav';nav['aria-label']='Main navigation';cls(nav,'desktop-nav');link(cta,'#contact');cls(cta,'header-cta')
home=doc.new_tag('a',href='#hero');home['aria-label']='Bennett home';logo.wrap(home)
for n,href in zip(children(nav),['#montana','#firm','#questions','#contact']):link(n,href)
text,seal=children(billboard);text.name='h1';cls(text,'vehicle-list');text['aria-label']='Cars, Motorhomes and RVs, Motorcycles, Boats and ATVs, Aircraft';cls(seal,'hero-seal')
text.clear();text.append(fragment('<span class="vehicle-track" aria-hidden="true">'+''.join('<span class="vehicle-line">'+v+'</span>' for v in ['Cars','Motorhomes &amp; RVs','Motorcycles','Boats &amp; ATVs','Aircraft']*2)+'</span>'))
link(children(below)[2],'#contact');cls(children(below)[2],'hero-cta')
header.append(fragment('<button class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu">Menu <span class="menu-bars" aria-hidden="true"></span></button>'))
billboard.append(fragment('<button class="motion-toggle" aria-pressed="false" aria-label="Pause vehicle animation">Ⅱ</button>'))

parts=children(adv)
names=['adv-title','company-title','adv-intro','adv-body','adv-link','adv-subtitle','office','company-body','company-cta','company-address','center-stripes']
for n,c in zip(parts,names):cls(n,c)
parts[-1]['preserveAspectRatio']='none'
for i in [0,1]:parts[i].name='h2'
for i in [0,2,3,4,5]:cls(parts[i],'reveal-left')
for i in [1,6,7,8,9]:cls(parts[i],'reveal-right')
link(parts[4],'#questions');link(parts[8],'#contact');parts[6]['role']='img';parts[6]['aria-label']='Bennett office at 124 W Pine Street'
# Approved content refinement: introduction and CTA left, considered approach right.
parts[7].string=parts[3].get_text()
parts[3].decompose();parts[5].decompose()
head,track,indicator=children(cards);cls(head,'situations-heading');cls(track,'cards-track');cls(indicator,'cards-indicator');children(head)[0].name='h2'
track['tabindex']='0';track['aria-label']='Six ways Bennett can help. Scroll horizontally or use arrow keys.'
for i,card in enumerate(children(track)):
    card.name='article';cls(card,'situation-card');card['id']='situation-'+str(i);children(children(card)[0])[0].name='h3'
cls(children(children(indicator)[0])[0],'cards-progress')
children(indicator)[1].name='button';children(indicator)[1]['aria-label']='Next situation';cls(children(indicator)[1],'next-card')

ghead,gbody,photo,tip,switch=children(gallery)
for n,c in zip([ghead,gbody,photo,tip,switch],['gallery-heading','gallery-intro','gallery-photo','gallery-tooltip','gallery-switcher']):cls(n,c)
ghead.name='h2';photo.name='button';photo['aria-label']='Enlarge Cars photograph';photo['type']='button';cls(children(photo)[0],'gallery-image');children(photo)[0]['role']='img';children(photo)[0]['aria-label']='Modern private garage by Architects Ink'
tip['aria-live']='polite';tabs,discuss=children(switch);cls(tabs,'vehicle-tabs');tabs['role']='tablist';tabs['aria-label']='Vehicle categories';link(discuss,'#contact')
for i,t in enumerate(children(tabs)):
    t.name='button';t['type']='button';t['role']='tab';t['aria-selected']='true' if i==0 else 'false';t['tabindex']='0' if i==0 else '-1';t['data-vehicle']=str(i);t['aria-controls']='vehicle-panel'
photo['id']='vehicle-panel';photo['role']='tabpanel'

sheet=children(firm)[0];cls(sheet,'letter-sheet');lp=children(sheet)
for el,name in zip(lp,['fold-one','fold-two','rule-left','rule-right','letter-lockup','sender','letter-subject','letter-body','letter-pillars','letter-signoff','letter-seal','letter-footer']):cls(el,name)
lp[6].name='h2';link(children(lp[9])[1],'tel:+14065435803')
cls(children(footer)[0],'footer-columns');cls(children(footer)[1],'footer-wordmark');cls(children(footer)[2],'footer-bottom')
mapping={'How It Works':'#montana','LLC Formation & Title Services':'#montana','Vehicles We Help With':'#vehicles','Renewals & Ongoing Support':'#situation-4','Our Story':'#firm','Our Attorneys':'#firm','Other Legal Services':'#contact','Frequently Asked Questions':'#questions','Speak with Bennett':'tel:+14065435803','Existing Client Inquiries':'tel:+14065435803','Existing Client Assistance':'tel:+14065435803','(406) 543-5803':'tel:+14065435803'}
for n in footer.find_all('div'):
    if not children(n) and n.get_text(strip=True) in mapping:link(n,mapping[n.get_text(strip=True)])
# Footer policy labels remain as designed; their pages are outside this prototype.

# The menu is taken directly from the mobile artboard, without the phone status bar.
menu_doc=convert('1NV-0');menu=children(menu_doc.find('div'))[1];menu.extract();menu.name='dialog';menu['id']='mobile-menu';menu['aria-label']='Navigation';cls(menu,'mobile-menu')
mh,ml,spacer,mb=children(menu);cls(mh,'menu-header');cls(ml,'menu-links');cls(mb,'menu-bottom');close=children(mh)[1];close.name='button';close['type']='button';close['data-close-menu']='';close['aria-label']='Close navigation'
mlinks={'Montana Registration':'#montana','The Montana advantage':'#montana','Vehicles we register':'#vehicles','How it works':'#situations','Our Firm':'#firm','Questions':'#questions','Contact':'#contact','Existing clients':'#contact','(406) 543-5803':'tel:+14065435803','Speak with Bennett':'#contact'}
for n in menu.find_all('div'):
    value=n.get_text(' ',strip=True)
    if value != 'Speak with Bennett' and value in mlinks and (not children(n) or all(x.name=='br' for x in children(n))):link(n,mlinks[value])
# Outer CTA is the actual target, preserving the supplied nested shape.
link(children(mb)[0],'#contact')

questions=[]
old=BeautifulSoup((BASE/'design-source/original-blue.html').read_text(),'html.parser')
for el in old.select('.stack--faq > .frame'):
    questions.append('<details><summary>'+el.h3.get_text()+'</summary><p>'+el.p.get_text()+'</p></details>')
faq='<dialog id="questions" class="content-dialog" aria-labelledby="faq-title"><button class="dialog-close" aria-label="Close questions">Close ×</button><h2 id="faq-title">A few things<br>worth knowing</h2>'+''.join(questions)+'</dialog>'
lightbox='<dialog id="lightbox" aria-label="Vehicle photograph"><button class="dialog-close" aria-label="Close photograph">Close ×</button><img alt=""><div class="lightbox-caption"></div></dialog>'
tokens={'--color-ink':'#161616','--color-ivory':'#F2EFDD','--color-blue-grey':'#878A91','--color-blue':'#2C4A9B','--font-display':'"Successor Trial"','--font-body':'"Malamocco Unlicensed Trial"'}
css=':root{'+''.join(k+':'+v+';' for k,v in tokens.items())+'--u:calc(100vw / 1440)}\n'+ '\n'.join(CSS)
(OUT/'css/paper.css').write_text(css)
headhtml='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Bennett — For those who know</title><meta name="description" content="Montana vehicle registration and personal legal counsel. Bennett Law Office, Missoula, Montana."><link rel="icon" href="assets/svg/logo.svg" type="image/svg+xml"><link rel="preload" href="assets/fonts/successor-light.otf" as="font" type="font/otf" crossorigin><link rel="preload" href="assets/fonts/malamocco-regular.otf" as="font" type="font/otf" crossorigin><link rel="stylesheet" href="css/paper.css"><link rel="stylesheet" href="css/round-two.css"></head><body><a class="skip-link" href="#montana">Skip to content</a>'
output=headhtml+str(root)+str(menu)+faq+lightbox+'<script src="js/round-two.js"></script></body></html>'
assets=OUT/'assets/round-two';assets.mkdir(exist_ok=True)
urls=list(dict.fromkeys(re.findall(r'https://app.paper.design/file-assets/[^)\"\s]+',css)))
for i,url in enumerate(urls):
    name='paper-'+str(i)+Path(url).suffix
    dest=assets/name
    if not dest.exists():dest.write_bytes(urllib.request.urlopen(url,timeout=30).read())
    output=output.replace(url,'assets/round-two/'+name)
    css=css.replace(url,'../assets/round-two/'+name)
(OUT/'css/paper.css').write_text(css)
(OUT/'index.html').write_text(output)
print('Built exact Paper markup,',len(CSS),'style rules;',len(urls),'image fills')
