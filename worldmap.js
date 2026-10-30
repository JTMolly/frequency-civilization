/* 世界觀 04〈世界地圖〉：互動星圖（六個地點的說明＋羅盤十二方位），淺色版 */
(function(){
  const PLACES={
    sea:{t:'海',s:'源頭',
      p:'在這張地圖上，我們把源頭畫成一片海，每個人都是海裡的一滴水珠，原本就是完整的。'},
    boat:{t:'船',s:'一個人',
      p:'方向是心裡知道想去哪裡，儀表板是身體，掌舵的是此時此地的你。不靠撐，油快沒了就靠岸。'},
    compass:{t:'羅盤',s:'十二方位＝語根',
      p:'十二個方位就是 12 語根。每艘船都能往每個方向走，只是慣走的方向不同；不是十二個島，不分你是哪一島的人。'},
    port:{t:'港',s:'家在地球',
      p:'不是逃離現實，是把清楚帶回工作、錢、身體和關係。'},
    tower:{t:'燈塔',s:'讓船看得到，再出航',
      p:'一直亮著，讓海上的船看得到；船補給好、穩了，就自己出航。'},
    village:{t:'港邊的村',s:'補給，再出航',
      p:'人來補給，再出航，不是住下來。它在人類的海岸上，不在另一個世界。'}
  };
  // 外層中文名：取自官網 roots/*.html 的標題；色碼取自各語根頁的 --root-c
  const ROOTS=[
    ["Sa'karan","建構者","sakaran","#b8892b"],["Valtara","集體整合者","valtara","#f8cb63"],["Elariah","情緒引導者","elariah","#e8806f"],
    ["Thaleon","洞察轉化者","thaleon","#5b3fa0"],["Auri'kai","直覺洞察者","aurikai","#5aa9c9"],["Mei'hara","關係共振者","meihara","#c98a7a"],
    ["Nael'tu","領航創造者","naeltu","#1d3f9a"],["Zae'rah","穩定支持者","zaerah","#1f6b6b"],["Rohen'dal","行動推動者","rohendal","#e2562b"],
    ["Ori'shan","節奏帶動者","orishan","#b5357f"],["Xon'teh","技術對接者","xonteh","#1f5fbf"],["Kuthari","系統記錄者","kuthari","#26365c"]
  ];
  const ORDER=['sea','boat','compass','port','tower','village'];
  const NS='http://www.w3.org/2000/svg';
  function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}

  // 在 <g id=...> 裡畫十二方位：刻度、點、名字（名字只在桌機寬度顯示，由 CSS 控制 .rname）
  window.drawCompassRing=function(g,o){
    const r=o.r, tick=o.tick||12, lr=o.labelR||r+16;
    ROOTS.forEach((n,i)=>{
      const a=(i*30-90)*Math.PI/180, c=Math.cos(a), s=Math.sin(a);
      el('line',{x1:(r-tick)*c,y1:(r-tick)*s,x2:r*c,y2:r*s,class:'rtick'},g);
      el('circle',{cx:(r+o.dot)*c,cy:(r+o.dot)*s,r:o.dotR||3,class:'rdot'},g);
      const t=el('text',{x:lr*c,y:lr*s+(o.fs?o.fs*0.36:6),class:'rname','text-anchor':Math.abs(c)<0.2?'middle':(c>0?'start':'end')},g);
      t.textContent=n[0];
    });
  };

  let current=null;
  function render(k){
    const box=document.getElementById('info'), d=PLACES[k]; current=k;
    let h='<h2>'+d.t+'<small>'+d.s+'</small></h2><p>'+d.p+'</p>';
    if(k==='compass'){
      h+='<div class="roots-list">'+ROOTS.map(r=>'<a href="roots/'+r[2]+'.html" style="--rc:'+r[3]+'"><b>'+r[0]+'</b>'+r[1]+'</a>').join('')+'</div>'+
         '<p class="note">每艘船都有十二個方向，只是慣走的不同；測驗看的是現在，會變。</p>';
    }
    box.innerHTML=h;
    syncOn();
  }
  function syncOn(){
    document.querySelectorAll('.hot').forEach(x=>x.classList.toggle('on',x.dataset.k===current));
    document.querySelectorAll('.chips button').forEach(x=>{x.classList.toggle('on',x.dataset.k===current);x.setAttribute('aria-pressed',x.dataset.k===current);});
  }
  // 給新畫出來的 .hot 補上鍵盤與讀屏屬性（地圖會依螢幕寬度重畫）
  function decorate(root){
    (root||document).querySelectorAll('.hot').forEach(g=>{
      g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',PLACES[g.dataset.k].t+'：'+PLACES[g.dataset.k].s);
    });
    syncOn();
  }
  window.FCMap={PLACES,ROOTS,ORDER,render,decorate};

  document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('.hot');if(g&&PLACES[g.dataset.k])render(g.dataset.k);});
  document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const g=e.target.closest&&e.target.closest('.hot');if(g&&PLACES[g.dataset.k]){e.preventDefault();render(g.dataset.k);}});
  document.addEventListener('DOMContentLoaded',()=>{
    const chips=document.querySelector('.chips');
    if(chips){ORDER.forEach(k=>{const b=document.createElement('button');b.type='button';b.dataset.k=k;b.setAttribute('aria-pressed','false');b.innerHTML=PLACES[k].t+'<small>'+PLACES[k].s+'</small>';b.addEventListener('click',()=>render(k));chips.appendChild(b);});}
    decorate();
  });
})();

(function(){
  const NS='http://www.w3.org/2000/svg';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root=document.documentElement, map=document.getElementById('map'), svg=document.getElementById('ov'), cv=document.getElementById('cv'), ctx=cv.getContext('2d');
  // 淺色主題
  const theme='light';

  // 兩種構圖：桌機橫式、手機直式（座標是 viewBox 單位）
  const LAYOUTS={
    land:{W:1200,H:780,
      coast:[[372,0],[350,58],[322,112],[318,160],[300,204],[262,248],[240,292],[222,330],[190,392],[156,462],[112,540],[60,616],[0,690]],
      landCorner:[[0,690],[0,0]],
      tower:{x:302,y:204,lamp:[302,166],beam:0.4,label:[334,124],sub:[334,150],hit:[262,94,250,130]},
      port:{x:224,y:330,dir:[1,0.18],label:[262,392],sub:[298,390],hit:[196,296,130,110]},
      village:{c:[132,250],pts:[[90,226],[128,206],[166,232],[114,268],[152,286],[78,270],[190,266],[138,240]],label:[132,180],sub:[132,330],hit:[56,150,160,190]},
      sea:{x:790,y:292,sub:[790,322],hit:[690,230,200,120]},
      boat:{x:636,y:478,s:1,label:[636,548],sub:[672,546],hit:[560,360,150,200]},
      course:'M590 486 C 500 480, 380 420, 268 340',
      compass:{x:998,y:556,r:112,names:true,cap:[998,384],label:[998,742],hit:120}},
    port:{W:600,H:920,
      coast:[[0,452],[46,418],[92,376],[124,330],[150,292],[188,262],[228,236],[252,200],[288,168],[338,124],[384,66],[414,0]],
      landCorner:[[414,0],[0,0]],
      tower:{x:254,y:200,lamp:[254,160],beam:0.7,label:[288,112],sub:[288,140],hit:[214,84,230,136]},
      port:{x:150,y:292,dir:[0.82,0.58],label:[176,384],sub:[214,382],hit:[120,262,140,130]},
      village:{c:[106,170],pts:[[64,150],[104,124],[146,150],[90,196],[134,206],[50,192],[170,182],[112,166]],label:[106,92],sub:[106,248],hit:[30,60,170,200]},
      sea:{x:450,y:336,sub:[450,370],hit:[370,270,160,130]},
      boat:{x:300,y:530,s:1.1,label:[300,600],sub:[346,598],hit:[220,410,170,205]},
      course:'M262 536 C 236 460, 214 390, 182 322',
      compass:{x:300,y:792,r:86,names:false,cap:[300,672],label:[150,898],hit:110}}
  };
  let L=null, layoutName='';
  function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
  function txt(cls,x,y,s,anchor,parent){const t=el('text',{class:cls,x,y,'text-anchor':anchor||'start'},parent);t.textContent=s;return t;}
  function lighten(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.round(r+(255-r)*f);g=Math.round(g+(255-g)*f);b=Math.round(b+(255-b)*f);return `rgb(${r},${g},${b})`;}

  function buildSVG(){
    svg.innerHTML='';
    svg.setAttribute('viewBox',`0 0 ${L.W} ${L.H}`);
    const defs=el('defs',{},svg);
    defs.innerHTML=`<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter>
      <radialGradient id="orb" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#fff6d8"/><stop offset=".35" stop-color="#ecca7c"/><stop offset=".8" stop-color="#c9a03a"/><stop offset="1" stop-color="#c9a03a" stop-opacity="0"/></radialGradient>
      <radialGradient id="orbHalo"><stop offset="0" stop-color="#e9c879" stop-opacity=".5"/><stop offset="1" stop-color="#e9c879" stop-opacity="0"/></radialGradient>
      <radialGradient id="dot"><stop offset="0" stop-color="#fff8e6"/><stop offset=".4" stop-color="#f0d9a0"/><stop offset="1" stop-color="#f0d9a0" stop-opacity="0"/></radialGradient>`;
    // 海岸：金色細線＋兩道淡淡的等深線
    const cpath='M'+L.coast.map(p=>p.join(' ')).join(' L ');
    const g0=el('g',{'pointer-events':'none'},svg);
    el('path',{d:cpath,class:'gl','stroke-width':6,opacity:.18,filter:'url(#glow2)'},g0);
    el('path',{d:cpath,class:'gl','stroke-width':1.5,opacity:.95,filter:'url(#glow)'},g0);
    const off=layoutName==='land'?[12,8]:[10,14];
    el('path',{d:cpath,class:'gl','stroke-width':.9,opacity:.35,'stroke-dasharray':'2 9',transform:`translate(${off[0]} ${off[1]})`},g0);
    el('path',{d:cpath,class:'gl','stroke-width':.8,opacity:.2,'stroke-dasharray':'1 12',transform:`translate(${off[0]*2.2} ${off[1]*2.2})`},g0);
    // 航線
    el('path',{d:L.course,class:'gl flow','stroke-width':6,opacity:.12,filter:'url(#glow2)'},g0);
    el('path',{d:L.course,class:'gl flow','stroke-width':1.6,'stroke-dasharray':'2 10',opacity:.9,filter:'url(#glow)'},g0);

    // —— 海
    {const s=L.sea, g=el('g',{class:'hot','data-k':'sea'},svg);
      el('rect',{class:'hit',x:s.hit[0],y:s.hit[1],width:s.hit[2],height:s.hit[3]},g);
      el('circle',{class:'selring',cx:s.x,cy:s.y-8,r:64},g);
      el('circle',{cx:s.x,cy:s.y-52,r:16,fill:'url(#dot)',class:'breathe'},g);
      el('circle',{cx:s.x,cy:s.y-52,r:2.6,class:'node'},g);
      txt('lbl',s.x,s.y,'海','middle',g); txt('sub',s.sub[0],s.sub[1],'源頭','middle',g);}

    // —— 船：細線和光點組成
    {const b=L.boat, g=el('g',{class:'hot','data-k':'boat'},svg);
      el('rect',{class:'hit',x:b.hit[0],y:b.hit[1],width:b.hit[2],height:b.hit[3]},g);
      const sh=el('g',{transform:`translate(${b.x} ${b.y}) scale(${b.s})`},g);
      el('circle',{class:'selring',cx:0,cy:-36,r:84},sh);
      el('ellipse',{cx:0,cy:-40,rx:70,ry:64,fill:'url(#orbHalo)',opacity:.35,class:'breathe'},sh);
      const lines='M-58 0 L58 0 L40 20 L-42 20 Z M0 0 V-94 M4 -88 L46 -12 L4 -12 M-4 -78 L-44 -12 L-4 -12 M0 -94 L18 -88 L0 -82';
      el('path',{d:lines,class:'gl','stroke-width':4,opacity:.18,filter:'url(#glow2)'},sh);
      el('path',{d:lines,class:'gl','stroke-width':1.3,filter:'url(#glow)'},sh);
      [[-58,0],[58,0],[40,20],[-42,20],[0,0],[4,-88],[46,-12],[-4,-78],[-44,-12],[0,-48]].forEach((p,i)=>{
        el('circle',{cx:p[0],cy:p[1],r:2.4,class:'node tw',style:`animation-delay:${-i*0.7}s`},sh);});
      el('circle',{cx:0,cy:-94,r:12,fill:'url(#dot)',class:'breathe'},sh);
      el('circle',{cx:0,cy:-94,r:3.4,fill:'#fff6dc'},sh);
      txt('lbl',b.label[0],b.label[1],'船','middle',g); txt('sub',b.sub[0],b.sub[1],'一個人','start',g);}

    // —— 羅盤：12 顆語根光點排成軌道
    {const c=L.compass, g=el('g',{class:'hot','data-k':'compass'},svg);
      el('circle',{class:'hit',cx:c.x,cy:c.y,r:c.r+c.hit*0.25},g);
      const cg=el('g',{transform:`translate(${c.x} ${c.y})`},g);
      el('circle',{class:'selring',r:c.r+(c.names?64:30)},cg);
      el('circle',{r:c.r*1.32,class:'gl spin','stroke-width':.8,'stroke-dasharray':'1 8',opacity:.45},cg);
      el('circle',{r:c.r,class:'gl','stroke-width':1,opacity:.55},cg);
      el('circle',{r:c.r*.62,class:'gl','stroke-width':.7,opacity:.25},cg);
      el('line',{x1:0,y1:-c.r*1.32,x2:0,y2:c.r*1.32,class:'gl','stroke-width':.6,opacity:.18},cg);
      el('circle',{r:c.r*.5,fill:'url(#orbHalo)',class:'breathe'},cg);
      el('circle',{r:c.r*.17,fill:'url(#orb)'},cg);
      FCMap.ROOTS.forEach((rt,i)=>{
        const a=(i*30-90)*Math.PI/180, x=c.r*Math.cos(a), y=c.r*Math.sin(a), col=rt[3];
        el('line',{x1:0,y1:0,x2:x,y2:y,stroke:lighten(col,.25),'stroke-width':.9,opacity:.5},cg);
        el('circle',{cx:x,cy:y,r:15,fill:lighten(col,.2),opacity:.5,filter:'url(#glow2)',class:'tw',style:`animation-delay:${-i*0.9}s`},cg);
        el('circle',{cx:x,cy:y,r:8,fill:'#fff8ea'},cg);
        el('circle',{cx:x,cy:y,r:6.4,fill:col},cg);
        el('circle',{cx:x-1.8,cy:y-1.8,r:1.6,fill:'#fff',opacity:.75},cg);
        if(c.names){const lr=c.r+26, cc=Math.cos(a);
          txt('rname',lr*cc,lr*Math.sin(a)+6,rt[0],Math.abs(cc)<0.2?'middle':(cc>0?'start':'end'),cg);}
      });
      txt('cap',c.cap[0],c.cap[1],'每艘船都有十二個方向','middle',g);
      txt('lbl',c.label[0],c.label[1],'羅盤','middle',g);}

    // —— 燈塔：一個亮點（光束在 canvas 上慢慢掃）
    {const t=L.tower, g=el('g',{class:'hot','data-k':'tower'},svg);
      el('rect',{class:'hit',x:t.hit[0],y:t.hit[1],width:t.hit[2],height:t.hit[3]},g);
      el('circle',{class:'selring',cx:t.lamp[0],cy:t.lamp[1],r:44},g);
      el('path',{d:`M${t.x-9} ${t.y} L${t.lamp[0]} ${t.lamp[1]+6} L${t.x+9} ${t.y}`,class:'gl','stroke-width':1.2,filter:'url(#glow)'},g);
      el('circle',{cx:t.x-9,cy:t.y,r:2,class:'node'},g); el('circle',{cx:t.x+9,cy:t.y,r:2,class:'node'},g);
      el('circle',{cx:t.lamp[0],cy:t.lamp[1],r:26,fill:'url(#dot)',class:'breathe'},g);
      el('circle',{cx:t.lamp[0],cy:t.lamp[1],r:4.2,fill:'#fffaf0'},g);
      txt('lbl',t.label[0],t.label[1],'燈塔','start',g); txt('sub',t.sub[0],t.sub[1],'讓船看得到，再出航','start',g);}

    // —— 港：海岸上一個停靠節點，兩道泊位線伸進海裡
    {const p=L.port, g=el('g',{class:'hot','data-k':'port'},svg);
      el('rect',{class:'hit',x:p.hit[0],y:p.hit[1],width:p.hit[2],height:p.hit[3]},g);
      el('circle',{class:'selring',cx:p.x+30*p.dir[0],cy:p.y+30*p.dir[1],r:52},g);
      const [dx,dy]=p.dir, nx=-dy, ny=dx, len=64;
      for(const o of [-9,9]){el('line',{x1:p.x+nx*o,y1:p.y+ny*o,x2:p.x+nx*o+dx*len,y2:p.y+ny*o+dy*len,class:'gl','stroke-width':1.3,filter:'url(#glow)'},g);
        for(const f of [.35,.7,1])el('circle',{cx:p.x+nx*o+dx*len*f,cy:p.y+ny*o+dy*len*f,r:2,class:'node tw',style:`animation-delay:${-f*3-o}s`},g);}
      el('circle',{cx:p.x,cy:p.y,r:14,fill:'url(#dot)',class:'breathe'},g);
      el('circle',{cx:p.x,cy:p.y,r:3.6,fill:'#fff6dc'},g);
      txt('lbl',p.label[0],p.label[1],'港','middle',g); txt('sub',p.sub[0],p.sub[1],'家在地球','start',g);}

    // —— 港邊的村：一小群相連的光點
    {const v=L.village, g=el('g',{class:'hot','data-k':'village'},svg);
      el('rect',{class:'hit',x:v.hit[0],y:v.hit[1],width:v.hit[2],height:v.hit[3]},g);
      el('circle',{class:'selring',cx:v.c[0],cy:v.c[1]+6,r:76},g);
      const P=v.pts, edges=new Set();
      P.forEach((a,i)=>{const d=P.map((b,j)=>[j,Math.hypot(a[0]-b[0],a[1]-b[1])]).filter(x=>x[0]!==i).sort((x,y)=>x[1]-y[1]).slice(0,2);
        d.forEach(([j])=>{const k=i<j?i+'-'+j:j+'-'+i;if(!edges.has(k)){edges.add(k);el('line',{x1:a[0],y1:a[1],x2:P[j][0],y2:P[j][1],class:'gl','stroke-width':.9,opacity:.6},g);}});});
      P.forEach((a,i)=>{el('circle',{cx:a[0],cy:a[1],r:9,fill:'url(#dot)',class:'tw',style:`animation-delay:${-i*1.3}s`},g);el('circle',{cx:a[0],cy:a[1],r:2.6,fill:'#fff3d4'},g);});
      txt('lbl',v.label[0],v.label[1],'港邊的村','middle',g); txt('sub',v.sub[0],v.sub[1],'補給，再出航','middle',g);}
    FCMap.decorate(svg);
  }

  // —— canvas：星塵、粒子海、燈塔光束
  let stars=[], sea=[], landDots=[], landPath=null, scale=1, dpr=1;
  function rnd(seed){let s=seed;return()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,s^=s+Math.imul(s^s>>>7,61|s),((s^s>>>14)>>>0)/4294967296));}
  function prepare(){
    const r=rnd(20261030);
    landPath=new Path2D('M'+L.coast.concat(L.landCorner).map(p=>p.join(' ')).join(' L ')+' Z');
    stars=[];const n=layoutName==='land'?220:170;
    for(let i=0;i<n;i++)stars.push({x:r()*L.W,y:r()*L.H,s:r()*1.4+.4,p:r()*6.28,v:.4+r()*1.2,g:r()<.25});
    sea=[];landDots=[];
    const tmp=document.createElement('canvas').getContext('2d');
    const stepX=layoutName==='land'?13:12, stepY=layoutName==='land'?17:18;
    for(let row=0,y=8;y<L.H;row++,y+=stepY){for(let x=(row%2)*stepX/2;x<L.W;x+=stepX){
      const inLand=tmp.isPointInPath(landPath,x,y);
      if(!inLand){if(!tmp.isPointInPath(landPath,x-16,y-16))sea.push({x,y,row});}
      else if(row%2===0&&Math.round(x/stepX)%2===0)landDots.push({x,y});}}
  }
  function resize(){
    const w=map.clientWidth;
    const want=w<600?'port':'land';
    if(want!==layoutName){layoutName=want;L=LAYOUTS[want];map.classList.toggle('portrait',want==='port');buildSVG();prepare();}
    const h=map.clientHeight; dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);scale=w/L.W;
    if(reduce||!running)drawFrame(reduce?0:lastT);
  }
  let lastT=0, running=false;
  function drawFrame(t){
    lastT=t; const dark=theme==='dark';
    ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);
    ctx.clearRect(0,0,L.W,L.H);
    const gold=dark?'232,210,158':'160,124,62';
    // 陸地：淡淡的點陣
    ctx.fillStyle=`rgba(${gold},${dark?.24:.26})`;
    for(const d of landDots)ctx.fillRect(d.x-.8,d.y-.8,1.6,1.6);
    // 星塵
    for(const s of stars){const a=(dark?.55:.22)*(.45+.55*Math.sin(t*.001*s.v+s.p));if(a<=0)continue;
      ctx.fillStyle=s.g?`rgba(240,210,140,${a})`:(dark?`rgba(250,244,230,${a})`:`rgba(${gold},${a})`);
      ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,6.283);ctx.fill();}
    // 粒子海：緩慢流動的波
    const T=t*.001;
    ctx.globalCompositeOperation=dark?'lighter':'source-over';
    for(const p of sea){
      const yy=p.y+5*Math.sin(p.x*.017+T*.55+p.row*.7)+2.5*Math.sin(p.x*.043-T*.38+p.row*1.3);
      const band=.5+.5*Math.sin(p.x*.009+p.row*.32-T*.42);
      const a=(dark?.08:.07)+(dark?.5:.38)*band*band*band;
      ctx.fillStyle=`rgba(${gold},${a})`;
      const s=1.1+band*1.1; ctx.fillRect(p.x-s/2,yy-s/2,s,s);
    }
    // 燈塔光束：慢慢來回掃
    const tw=L.tower, ang=tw.beam+Math.sin(T*.2)*.3, len=layoutName==='land'?640:580;
    const gr=ctx.createRadialGradient(tw.lamp[0],tw.lamp[1],4,tw.lamp[0],tw.lamp[1],len);
    gr.addColorStop(0,dark?'rgba(248,226,170,.16)':'rgba(214,170,80,.13)');gr.addColorStop(.45,dark?'rgba(240,210,140,.05)':'rgba(214,170,80,.04)');gr.addColorStop(1,'rgba(240,210,140,0)');
    ctx.fillStyle=gr;
    for(const half of [.03,.06,.1,.15]){ctx.beginPath();ctx.moveTo(tw.lamp[0],tw.lamp[1]);ctx.arc(tw.lamp[0],tw.lamp[1],len,ang-half,ang+half);ctx.closePath();ctx.fill();}
    ctx.globalCompositeOperation='source-over';
  }
  function loop(t){if(!running)return;drawFrame(t);requestAnimationFrame(loop);}
  function start(){if(reduce||running)return;running=true;requestAnimationFrame(loop);}
  function stop(){running=false;}
  resize();
  window.addEventListener('resize',resize);
  if(!reduce){
    const io=new IntersectionObserver(es=>{es[0].isIntersecting&&!document.hidden?start():stop();});io.observe(map);
    document.addEventListener('visibilitychange',()=>{document.hidden?stop():start();});
    start();
  }
})();
