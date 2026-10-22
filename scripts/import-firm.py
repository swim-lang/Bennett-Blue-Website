from pathlib import Path
import re,json,html,urllib.request,concurrent.futures,subprocess
from bs4 import BeautifulSoup
BASE=Path(__file__).resolve().parents[1]
CSS=[]
def convert(name):
 s=(BASE/'design-source'/f'{name}.jsx').read_text().strip()[1:-1]
 def style(m):
  rules=[]
  for key,val in re.findall(r"(\w+):\s*('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"|-?[\d.]+)",m.group(1)):
   prop=re.sub(r'[A-Z]',lambda x:'-'+x[0].lower(),key)
   value=val[1:-1] if val[0] in '\"\'' else val
   value=value.replace('\\\"','\"')
   if val[0] not in '\"\'' and prop not in ['font-weight','opacity','flex-grow','flex-shrink','order','z-index']:value+='px'
   if prop=='font-family' and not value.startswith('var('):
    if 'Successor' in value:value='var(--font-display)'
    elif 'Malamocco' in value:value='var(--font-body)'
   value=value.replace('#2C4A9B','var(--color-blue)')
   rules.append(prop+':'+value)
  return 'style="'+html.escape(';'.join(rules),quote=True)+'"'
 s=re.sub(r'style=\{\{(.*?)\}\}',style,s,flags=re.S)
 for a,b in {'strokeWidth':'stroke-width','fillRule':'fill-rule','clipRule':'clip-rule','strokeLinecap':'stroke-linecap','strokeLinejoin':'stroke-linejoin','fillOpacity':'fill-opacity','strokeOpacity':'stroke-opacity'}.items():s=s.replace(a+'=',b+'=')
 s=re.sub(r'<div([^>]*?)/>',r'<div\1></div>',s)
 soup=BeautifulSoup(s,'html.parser')
 for t in list(soup.find_all(string=True)):
  if t.strip():t.replace_with(t.strip())
  else:t.extract()
 for el in soup.select('[style]'):
  raw=el['style'];scaled=re.sub(r'(-?\d+(?:\.\d+)?)px',r'calc(\1 * var(--u))',raw)
  cls='f'+str(len(CSS));CSS.append('.'+cls+'{'+scaled+'}');el['class']=el.get('class',[])+[cls];del el['style']
 for el in soup.select('[id]'):
  el['data-paper']=el['id'];del el['id']
 return soup

def cls(n,c):n['class']=n.get('class',[])+c.split();return n
def kids(n):return n.find_all(recursive=False)
def frag(s):return BeautifulSoup(s,'html.parser')
main=convert('our-firm');profile=convert('thad-profile')
root=main.find('div');root.name='main';root['id']='page';cls(root,'our-firm-page')
sections=kids(root)
for el,name in zip(sections,['firm-intro','story','people','garage','montana-home','working','contact']):el.name='section';el['id']=name;cls(el,name)
def node(id):return main.find(attrs={'data-paper':id})
# Use the already-tested shared header, footer and dialogs.
home=BeautifulSoup((BASE/'index.html').read_text(),'html.parser')
for a in home.select('.desktop-nav a'):
 if a.get_text(strip=True)=='Contact':a.decompose()
for a in home.find_all('a',href=True):
 if a['href']=='#firm' or a.get_text(strip=True) in ['Our Story','Our Attorneys','Meet Bennett']:
  a['href']='our-firm.html'+('#people' if a.get_text(strip=True)=='Our Attorneys' else '#story' if a.get_text(strip=True)=='Our Story' else '')
(BASE/'index.html').write_text(str(home).replace('viewbox=','viewBox='))
header=BeautifulSoup(str(home.select_one('.site-header')),'html.parser').find('header')
for a in header.select('a[href]'):
 if a['href']=='#hero':a['href']='index.html'
 if a['href']=='#montana':a['href']='index.html#montana'
 if a.get_text(strip=True)=='Our Firm':a['aria-current']='page'
node('48O-1').replace_with(header)
footer=BeautifulSoup(str(home.select_one('.contact')),'html.parser').find('footer')
for a in footer.select('a[href]'):
 if a['href'] in ['#montana','#vehicles','#situations']:a['href']='index.html'+a['href']
sections[-1].replace_with(footer)
# Source-backed headings and semantics.
for id,tag in [('48P-1','h1'),('4AC-1','h2'),('4AJ-1','h2'),('4C6-1','h2'),('4D2-1','h2')]:
 n=node(id)
 if n:n.name=tag
node('4C6-1').string='In the garage.'
node('4C9-1').string='Ask us what belongs in the garage, and the conversation can run a little longer.'
node('4HR-1').string='Garage notes';node('4HY-1').string='Garage notes'
node('4HS-1').string='The four-wheel variety';node('4HZ-1').string='The two-wheel variety'
# Native buttons on each license card and the matching text links.
for id,person in [('4AO-1','thad'),('4BD-1','duncan')]:
 n=node(id)
 if n:n.name='button';n['type']='button';n['data-profile']=person;n['aria-label']='Meet '+person.title();cls(n,'license-card')
for n in main.find_all(string=lambda t:t and t.strip() in ['Meet Thad','Meet Duncan']):
 p=n.parent
 while p.parent and p.parent.get('data-paper') not in ['4AN-1','4BC-1']:p=p.parent
 p.name='button';p['type']='button';p['data-profile']='thad' if 'Thad' in n else 'duncan'
for id in ['4I4-1','4I9-1']:cls(node(id),'signature')
for id in ['4IC-1','4IE-1']:cls(node(id),'card-watermark')
for id,alt in [('4HD-1','Bennett office on Pine Street'),('4HJ-1','Historic view of the Missoula office'),('4AT-1','Thad Brinkman'),('4BI-1','Duncan McMullin'),('4HP-1','Porsche in a garage, stock photograph'),('4HW-1','Triumph motorcycle in a modern garage, stock photograph')]:
 n=node(id)
 if n:n['role']='img';n['aria-label']=alt
# Keep chosen stock imagery editorial, without implying personal ownership.
cls(node('4HP-1'),'garage-car');cls(node('4HW-1'),'garage-bike')
media=node('4CV-1');cls(media,'montana-film');media.clear();media.append(frag('<video muted loop playsinline preload="none" poster="assets/firm/montana-poster.jpg" aria-label="Aerial view of Montana mountains"><source data-src="assets/firm/montana.mp4" type="video/mp4"></video><button type="button" class="video-toggle" aria-label="Play Montana film">Play film</button>'))
# Preserve the complete profile design, including explicitly marked draft details.
modal=kids(profile.find('div'))[0];modal.name='dialog';modal['id']='profile-dialog';cls(modal,'profile-dialog');modal['aria-labelledby']='profile-name'
modal.find(attrs={'data-paper':'4GS-1'})['id']='profile-name'
modal.find(attrs={'data-paper':'4GS-1'}).name='h2'
for t in modal.find_all(string=lambda t:t and t.strip()=='Close'):
 p=t.parent
 while p.parent!=modal:p=p.parent
 p.name='button';p['type']='button';cls(p,'profile-close');p['aria-label']='Close profile'
cta=modal.find(attrs={'data-paper':'4GO-1'});cta.name='a';cta['href']='mailto:hello@bennettlawofficepc.com';cls(cta,'profile-contact')
# Shared questions and mobile menu.
dialogs=[]
for id in ['mobile-menu','questions']:
 d=home.find(id=id)
 if d:
  for a in d.find_all('a',href=True):
   if a['href'] in ['#hero','#montana','#vehicles','#situations']:a['href']='index.html'+a['href']
  dialogs.append(str(d))
for a in main.find_all(string=lambda t:t and t.strip()=='Explore Montana Registration'):
 p=a.parent;p.name='a';p['href']='index.html#montana'
# Use the homepage curve geometry only where a separating ink edge is needed.
for id in ['4G8-1','4C3-1','4DD-1']:
 n=node(id)
 if n:n.decompose()
for id in ['49Y-1','4CY-1']:
 n=node(id);cls(n,'section-oval-edge');n['preserveAspectRatio']='none';n['aria-hidden']='true'
footer.append(frag('<svg class="section-oval-edge" viewBox="0 0 1440 72" preserveAspectRatio="none" aria-hidden="true"><path d="M0 65.25 A720 64 0 0 1 1440 65.25" fill="none" stroke="#161616" stroke-width="2.5"/></svg>'))
for n in main.select('.video-toggle'):n.decompose()
# Collect all Paper media locally and replace exported references.
css='\n'.join(CSS)
urls=sorted(set(re.findall(r'https://app.paper.design/file-assets/[^)]+',css)))
def download(url):
 filename=url.rsplit('/',1)[-1];dest=BASE/'assets/firm'/filename
 if not dest.exists() or not dest.stat().st_size:subprocess.run(['curl','-fsSL',url,'-o',str(dest)],check=True)
 return url,'../assets/firm/'+filename
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 for url,local in ex.map(download,urls):css=css.replace(url,local)
(BASE/'css/firm-paper.css').write_text(css)
head=BeautifulSoup(str(home.head),'html.parser');head.title.string='Our Firm — Bennett'
for script in head.find_all('script'):
 if not script.get('src'):script.decompose()
for m in head.select('meta[property="og:title"],meta[name="twitter:title"]'):m['content']='Our Firm — Bennett'
head.select_one('meta[property="og:url"]')['content']='https://swim-lang.github.io/Bennett-Blue-Website/preview/our-firm.html'
head.head.append(frag('<link rel="stylesheet" href="css/firm-paper.css"><link rel="stylesheet" href="css/firm.css">'))
htmlout='<!doctype html><html lang="en">'+str(head)+'<body class="firm-page"><a class="skip-link" href="#story">Skip to content</a>'+str(root)+''.join(dialogs)+str(modal)+'<script src="js/firm.js"></script></body></html>'
(BASE/'our-firm.html').write_text(htmlout.replace('viewbox=','viewBox=').replace('preserveaspectratio=','preserveAspectRatio='))
print('Built Our Firm with',len(CSS),'source style rules and',len(urls),'local assets')
