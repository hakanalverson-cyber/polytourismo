import sys,asyncio,json
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W=ROOT+'/dist'  # built game lives here
OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
def run(html,steps,out_prefix='s',size=(1280,720)):
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        pg=b.new_page(viewport={'width':size[0],'height':size[1]})
        logs=[]
        pg.on('console',lambda m:logs.append(m.type+': '+m.text))
        pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)+' | '+str(getattr(e,'stack',''))[:400]))
        def route(r):
            u=r.request.url
            if 'three.min.js' in u: r.fulfill(path=ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
            elif 'GLTFLoader' in u: r.fulfill(path=ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
            else: r.abort()
        pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith('file:') else route(r))
        pg.goto('file://'+html)
        pg.wait_for_timeout(1500)
        for i,s in enumerate(steps):
            if s[0]=='js': 
                try: print('JS->',pg.evaluate(s[1]))
                except Exception as e: print('JSERR',e)
            elif s[0]=='img':
                import base64
                d=pg.evaluate(s[2]);open(OUT+'/'+out_prefix+'_'+s[1]+'.png','wb').write(base64.b64decode(d.split(',')[1]))
            elif s[0]=='wait': pg.wait_for_timeout(s[1])
            elif s[0]=='shot': pg.screenshot(path=OUT+'/'+out_prefix+'_'+s[1]+'.png')
            elif s[0]=='key': pg.keyboard.press(s[1])
            elif s[0]=='down': pg.keyboard.down(s[1])
            elif s[0]=='up': pg.keyboard.up(s[1])
            elif s[0]=='click': pg.click(s[1])
        print('\n'.join(logs[-25:]))
        b.close()
if __name__=='__main__':
    run(sys.argv[1],json.loads(sys.argv[2]))
