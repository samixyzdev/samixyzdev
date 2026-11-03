"""Render an abstract pipeline view from archived presentation snapshots."""
import json
from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parent.parent
frames=json.loads((ROOT/'assets/processor-trace.json').read_text())['frames']
bounds=[0,.07407,.15509,.23611,.31713,.39815,.47917,.56019,.64120,1]
notes=[('Pipeline fill','Two loads enter decode.'),('Micro-op expansion','Each load becomes address calculation + memory access.'),('Two addresses in parallel','Lane 0 computes 4; lane 1 computes 5.'),('Waiting for memory','The load holds the issue packet. Address results write back.'),('First memory response','The first load receives word 0 from block 4.'),('Second memory response','The next load receives word 1; r1 writes back as 5.'),('Forwarding resolves the dependency','WB lane 1 supplies r2 = 6. The ADD computes 5 + 6 = 11.'),('Stop requested','HALT reaches execution while the ADD writes back 11.'),('Trace complete','r1 = 5, r2 = 6, r3 = 11. Younger operations are flushed.')]
def text(x,y,s,cls='body',extra=''):
 return f'<text x="{x}" y="{y}" class="{cls}" {extra}>{escape(str(s))}</text>'
def rect(x,y,w,h,cls='panel',rx=12):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="{cls}"/>'
def token(x,y,w,label,muted=False):
 if not label:return rect(x,y,w,32,'empty',6)+text(x+12,y+21,'—','muted')
 kind='addr' if label.endswith('EA') else 'load' if label.endswith(('LD','LW')) else 'halt' if label.endswith(('HLT','HALT')) else 'alu'
 return f'<g opacity="{.35 if muted else 1}">'+rect(x,y,w,32,kind,6)+text(x+12,y+21,label.replace('.', ' / '),'token')+'</g>'
def render(mobile):
 w,h=(600,908) if mobile else (1040,588)
 positions=[(24,134),(312,134),(24,422),(312,422)] if mobile else [(28,134),(280,134),(532,134),(784,134)]
 cw=264 if mobile else 228; ch=266
 out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">LC2K execution trace · V2.1</title><desc id="desc">Abstract stage snapshots of two loads, an add and a halt. Original trace values preserved; queue entries shown in physical slot order with empty slots omitted. Not a circuit schematic.</desc>', '''<style>
:root{color-scheme:light dark}text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.bg{fill:#fff;stroke:#d8dee7}.panel{fill:#f8fafc;stroke:#e1e6ed}.empty{fill:#eef2f6;stroke:none}.body{fill:#354357;font-size:14px}.muted{fill:#758196;font-size:12px}.eyebrow{fill:#60728c;font-size:11px;font-weight:600;letter-spacing:1.5px}.title{fill:#152336;font-size:26px;font-weight:600;letter-spacing:-.5px}.heading{fill:#233349;font-size:15px;font-weight:600}.token{fill:#233349;font:500 12px ui-monospace,SFMono-Regular,Consolas,monospace}.addr{fill:#e8f0fc;stroke:#bfd2ed}.load{fill:#fff3db;stroke:#ead6aa}.alu{fill:#e4f3ed;stroke:#b3d7c7}.halt{fill:#f4eaf1;stroke:#d8bfd0}.rule{stroke:#dfe5ed;stroke-width:1}.number{fill:#20324b;font:500 21px ui-monospace,SFMono-Regular,Consolas,monospace}.flow{fill:none;stroke:#91a3b9;stroke-width:1.5;stroke-linejoin:round}.arrow{fill:#91a3b9}.bypass{fill:none;stroke:#27836b;stroke-width:2;stroke-linejoin:round}.bypass-arrow{fill:#27836b}.bypass-label{fill:#27836b;font:500 11px ui-monospace,SFMono-Regular,Consolas,monospace}.signal{stroke-dasharray:5 5;animation:travel 1.2s linear infinite}@keyframes travel{to{stroke-dashoffset:-20}}.reduced-state{display:none}
@media(prefers-color-scheme:dark){.bg{fill:#0d1117;stroke:#303947}.panel{fill:#151c26;stroke:#2b3544}.empty{fill:#1d2734}.body,.token,.heading,.number{fill:#d8e3f1}.title{fill:#edf3fa}.muted,.eyebrow{fill:#92a2b9}.addr{fill:#20324d;stroke:#3c5677}.load{fill:#3b3220;stroke:#645331}.alu{fill:#1f3833;stroke:#37594e}.halt{fill:#372938;stroke:#5a435a}.rule{stroke:#303947}.bypass{stroke:#72cdb3}.bypass-arrow{fill:#72cdb3}.bypass-label{fill:#72cdb3}}
@media(prefers-reduced-motion:reduce){.motion-state{display:none}.reduced-state{display:inline}.signal{animation:none}}
</style>''',rect(1,1,w-2,h-2,'bg',16),text(28,34,'COMPUTER ARCHITECTURE','eyebrow'),text(w-28,34,'TRACE / V2.1','eyebrow','text-anchor="end"'),text(28,73,'Two-wide. One dependency.','title'),text(28,102,'LC2K · two loads → add → halt','body')]
 for j,(x,y) in enumerate(positions):
  out += [rect(x,y,cw,ch),text(x+16,y+27,f'0{j+1}','eyebrow'),text(x+48,y+27,['Decode','Micro-op queue','Execute','Writeback'][j],'heading'),text(x+16,y+51,['Up to two instructions','Occupied slots · compact view','Issue packet → functional units','EX packet → register file'][j],'muted')]
  if j in (2,3):
   for k in range(2):out.append(text(x+16,y+83+k*82,f'LANE {k}'+(' / ALU + LSU' if j==2 and k else ' / ALU' if j==2 else ''),'eyebrow'))
 # Forward paths remain visible so the panels read as connected stages.
 out.append('<defs><marker id="flow-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path class="arrow" d="M0 0L5 2.5L0 5Z"/></marker><marker id="bypass-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path class="bypass-arrow" d="M0 0L5 2.5L0 5Z"/></marker></defs>')
 routes = ['M288 244H310','M444 400V411H156V420','M288 532H310','M288 614H310'] if mobile else ['M256 244H278','M508 244H530','M760 244H782','M760 326H782']
 for route in routes:
  out.append(f'<path class="flow" d="{route}" marker-end="url(#flow-arrow)"/>')
 bypass = 'M444 688V734H156V690' if mobile else 'M898 400V446H646V402'
 out.append(f'<path class="flow" opacity=".4" d="{bypass}" marker-end="url(#flow-arrow)"/>')
 out.append(text(300 if mobile else 772,728 if mobile else 440,'WRITEBACK BYPASS','muted','text-anchor="middle"'))
 def state(i):
  f=frames[i]; content=[]
  if i in (3,6):
   content.append(f'<path class="bypass signal" d="{bypass}" marker-end="url(#bypass-arrow)"/>')
   content.append(text(300 if mobile else 772,710 if mobile else 422,'r1 = 4 → LOAD' if i==3 else 'r2 = 6 → ADD','bypass-label','text-anchor="middle"'))
  for j,(x,y) in enumerate(positions):
   if j==0:
    for k in range(2):content.append(token(x+16,y+76+k*44,cw-32,f['decode'][k] if k<len(f['decode']) else None,i==8))
    content.append(text(x+16,y+237,'Younger instructions dim at HALT.','muted') if mobile else text(x+16,y+237,'Dimmed on flush.','muted'))
   elif j==1:
    tw=(cw-40)/2
    for k in range(8):content.append(token(x+16+(k%2)*(tw+8),y+76+(k//2)*42,tw,f['queue'][k] if k<len(f['queue']) else None,i==8))
   else:
    key='execute' if j==2 else 'writeback'
    for k in range(2):
     content.append(token(x+16,y+94+k*82,cw-32,f[key][k],i==8 and j==2))
     if j==2 and f[key][k]:content.append(text(x+16,y+145+k*82,'Stop request' if f[key][k].endswith('HLT') else f['results'][k],'muted'))
  fy=768 if mobile else 480
  content += [text(28,fy,notes[i][0],'heading'),text(w-28,fy,f['cycle'],'eyebrow','text-anchor="end"')]
  # Wrap explanatory copy manually to preserve legibility at narrow widths.
  note=notes[i][1]
  if mobile and len(note)>70:
   split=note.rfind(' ',0,65);content += [text(28,fy+24,note[:split],'body'),text(28,fy+43,note[split+1:],'body')]
  else:content.append(text(28,fy+24,note,'body'))
  ry=h-26
  content.append(text(28,ry,'REGFILE','eyebrow'))
  for k in range(3):content.append(text(130+k*(130 if mobile else 150),ry,f'r{k+1}  {f["registers"][k]}','number'))
  return ''.join(content)
 for i in range(9):
  times=([0,bounds[1],1] if i==0 else [0,bounds[i],1] if i==8 else [0,bounds[i],bounds[i+1],1]); vals='1;0;0' if i==0 else '0;1;1' if i==8 else '0;1;0;0'
  out.append(f'<g class="motion-state" opacity="0"><animate attributeName="opacity" dur="20.52s" repeatCount="indefinite" calcMode="discrete" values="{vals}" keyTimes="{";".join(map(str,times))}"/>{state(i)}</g>')
 out.append('<g class="reduced-state">'+state(6)+'</g></svg>')
 return '\n'.join(out)
for mobile in (False,True):
 (ROOT/'assets'/('lc2k-pipeline-mobile.svg' if mobile else 'lc2k-pipeline.svg')).write_text(render(mobile)+'\n')
