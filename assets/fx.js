/* Light 3D hero terrain (Three.js) and hero intro (GSAP). Skipped for reduced motion. */
(function(){
  var hero=document.querySelector('.phero');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!hero||reduce)return;
  var seg=document.body.getAttribute('data-seg')||'';
  var col=getComputedStyle(document.body).getPropertyValue('--acc').trim()||'#d6f06a';
  function load(src,cb){var s=document.createElement('script');s.src=src;s.onload=cb;s.async=true;document.head.appendChild(s)}
  load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',function(){
    var t=hero.querySelectorAll('.crumb,h1,.lead,.xp,.btns');
    gsap.from(t,{y:24,opacity:0,duration:.9,ease:'power3.out',stagger:.09});
  });
  load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',function(){
    var c=document.createElement('canvas');c.className='fx3d';c.setAttribute('aria-hidden','true');hero.insertBefore(c,hero.firstChild);
    var R;try{R=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true})}catch(e){c.remove();return}
    R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    var S=new THREE.Scene(),C=new THREE.PerspectiveCamera(42,1,.1,100);C.position.set(0,7.5,11);C.lookAt(0,0,-1);
    var N=90,W=22,D=16,g=new THREE.PlaneGeometry(W,D,N,Math.round(N*D/W));g.rotateX(-Math.PI/2);
    var P=g.attributes.position,base=new Float32Array(P.count);
    function h(x,z){return 1.5*Math.sin(x*.35+1.3)*Math.cos(z*.42)+.8*Math.sin(x*.9+z*.6)+.35*Math.sin(x*2.1-z*1.7)+.9*Math.exp(-((x-3)*(x-3)+(z+2)*(z+2))/10)}
    for(var i=0;i<P.count;i++){var y=h(P.getX(i),P.getZ(i));P.setY(i,y);base[i]=y}
    var cc=new THREE.Color(col),cols=new Float32Array(P.count*3);g.setAttribute('color',new THREE.BufferAttribute(cols,3));
    var pts=new THREE.Points(g,new THREE.PointsMaterial({size:.06,vertexColors:true,transparent:true,opacity:.95}));S.add(pts);
    var wire=new THREE.LineSegments(new THREE.WireframeGeometry(g),new THREE.LineBasicMaterial({color:cc,transparent:true,opacity:.07}));S.add(wire);
    function size(){var w=c.clientWidth,hh=c.clientHeight;if(!w||!hh)return;R.setSize(w,hh,false);C.aspect=w/hh;C.updateProjectionMatrix()}
    size();addEventListener('resize',size);
    var mx=0,my=0;addEventListener('pointermove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
    var vis=true;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(hero);
    var t0=performance.now(),dim=new THREE.Color(col).multiplyScalar(.28);
    function frame(now){requestAnimationFrame(frame);if(!vis||document.hidden)return;
      var t=(now-t0)/1000;
      /* front sweeping across the terrain: an isochrone for natural disasters, a scan line elsewhere */
      var fx=((t*1.6)%(W+8))-W/2-4;
      for(var i=0;i<P.count;i++){var x=P.getX(i),z=P.getZ(i);
        var f=seg==='n'?x+Math.sin(z*.7)*1.2:z*1.1+x*.2;
        var d=seg==='n'?fx-f:((t*1.4)%(D+6))-D/2-3-z;
        var k=Math.exp(-d*d*1.6),burn=seg==='n'&&d>0?.35:0;
        P.setY(i,base[i]+(seg==='n'?0:.06*Math.sin(t*.8+x*.5+z*.4)));
        var r=dim.r+(cc.r-dim.r)*Math.min(1,k+burn),gg=dim.g+(cc.g-dim.g)*Math.min(1,k+burn),b=dim.b+(cc.b-dim.b)*Math.min(1,k+burn);
        cols[i*3]=r+k*.4;cols[i*3+1]=gg+k*.4;cols[i*3+2]=b+k*.4}
      P.needsUpdate=true;g.attributes.color.needsUpdate=true;
      S.rotation.y=-.35+mx*.25+Math.sin(t*.1)*.05;S.rotation.x=my*.08;
      R.render(S,C)}
    requestAnimationFrame(frame);requestAnimationFrame(function(){c.classList.add('on')});
  });
})();
