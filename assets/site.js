(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var b=document.getElementById('menu'),n=document.getElementById('nav');
  if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
    n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');b.setAttribute('aria-expanded',false)}})}

  /* the cycle: hero (auto) and scenes (scroll-driven) */
  function Cycle(el,sfx,ids){
    var S=window.STAGES,A=window.ANG,nodes=[].slice.call(el.querySelectorAll('.node')),mk=document.getElementById('mk'+sfx);
    var ck=document.getElementById(ids[0]),ct=document.getElementById(ids[1]),cp=document.getElementById(ids[2]);
    var R=226,pos=A[0],target=A[0],cur=-1,self={};
    function xy(a,r){var t=a*Math.PI/180;return[320+r*Math.sin(t),320-r*Math.cos(t)]}
    function setMk(a){var p=xy(a,R);mk.setAttribute('transform','translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')')}
    self.sel=function(i){if(i===cur)return;cur=i;var s=S[i];
      nodes.forEach(function(g,j){g.classList.toggle('on',j===i);g.setAttribute('aria-pressed',j===i)});
      ck.textContent=('0'+(i+1)).slice(-2)+' / 08';ct.textContent=s.t;cp.textContent=s.ph;cp.style.color=s.c;
      var t=A[i];while(t<pos-0.01)t+=360;while(t-pos>=360)t-=360;target=t;if(reduce){pos=target;setMk(pos%360)}};
    self.cur=function(){return cur};
    self.tick=function(dt){if(pos<target){pos=Math.min(target,pos+dt*110)}setMk(pos%360)};
    self.nodes=nodes;
    setMk(pos);self.sel(0);return self;
  }
  var hero=document.getElementById('cyc'),sc=document.getElementById('cyc2'),cycles=[];
  if(window.STAGES){
    var stages=[].slice.call(document.querySelectorAll('.stage'));
    function goStage(i){var st=stages[i];if(st)st.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})}
    if(hero){var H=Cycle(hero,'a',['ck','ct','cp']);cycles.push(H);var auto=!reduce,tA=0;
      H.nodes.forEach(function(g,i){function go(){auto=false;H.sel(i);goStage(i)}g.addEventListener('click',go);g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
      H.auto=function(dt){if(!auto)return;tA+=dt;if(tA>2.8){tA=0;H.sel((H.cur()+1)%8)}};}
    if(sc){var C=Cycle(sc,'b',['ck2','ct2','cp2']);cycles.push(C);
      C.nodes.forEach(function(g,i){function go(){C.sel(i);goStage(i)}g.addEventListener('click',go);g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
      if('IntersectionObserver' in window){var io2=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting)C.sel(+x.target.getAttribute('data-i'))})},{rootMargin:'-45% 0px -45% 0px'});stages.forEach(function(st){io2.observe(st)})}}
    if(!reduce&&cycles.length){var last=null;(function frame(ts){if(last===null)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;if(H&&H.auto)H.auto(dt);cycles.forEach(function(c){c.tick(dt)});requestAnimationFrame(frame)})(performance.now())}
  }

  /* videos play when visible */
  var vs=[].slice.call(document.querySelectorAll('video[data-auto]'));
  if(vs.length){
    if(reduce||!('IntersectionObserver' in window))vs.forEach(function(v){v.controls=true});
    else{var io=new IntersectionObserver(function(en){en.forEach(function(x){var v=x.target;if(x.isIntersecting){v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){v.controls=true})}else v.pause()})},{threshold:.4});
      vs.forEach(function(v){io.observe(v)})}
  }
  /* insights filter */
  var feed=document.getElementById('feed');
  if(feed){
    var bs=[].slice.call(document.querySelectorAll('.filt button'));
    function set(f){feed.classList.remove('only-s','only-n');if(f)feed.classList.add('only-'+f);bs.forEach(function(x){x.setAttribute('aria-pressed',x.getAttribute('data-f')===f)})}
    bs.forEach(function(x){x.addEventListener('click',function(){var f=x.getAttribute('data-f');set(f);try{history.replaceState(null,'',f?'?f='+f:location.pathname)}catch(e){}})});
    var q=(location.search.match(/f=([sn])/)||[])[1];if(q)set(q);
  }
})();
