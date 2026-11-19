/* Hero 3D (Three.js) with a pattern per page theme, and hero intro (GSAP). Skipped for reduced motion. */
(function(){
  var hero=document.querySelector('.phero');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!hero||reduce)return;
  var fx=document.body.getAttribute('data-fx')||'terrain';
  var col=getComputedStyle(document.body).getPropertyValue('--acc').trim()||'#d6f06a';
  function load(src,cb){var s=document.createElement('script');s.src=src;s.onload=cb;s.async=true;document.head.appendChild(s)}
  load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',function(){
    gsap.from(hero.querySelectorAll('.crumb,h1,.lead,.xp,.btns'),{y:24,opacity:0,duration:.9,ease:'power3.out',stagger:.09});
  });
  load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',function(){
    var c=document.createElement('canvas');c.className='fx3d';c.setAttribute('aria-hidden','true');hero.insertBefore(c,hero.firstChild);
    var R;try{R=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true})}catch(e){c.remove();return}
    R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    var S=new THREE.Scene(),C=new THREE.PerspectiveCamera(42,1,.1,200);C.position.set(0,7.5,11);C.lookAt(0,0,-1);
    var CC=new THREE.Color(col),DIM=CC.clone().multiplyScalar(.26);
    var seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
    function mix(a,k,out,i){k=Math.max(0,Math.min(1.4,k));out[i*3]=DIM.r+(CC.r-DIM.r)*k;out[i*3+1]=DIM.g+(CC.g-DIM.g)*k;out[i*3+2]=DIM.b+(CC.b-DIM.b)*k}
    function pts(geo,size){var n=geo.attributes.position.count,cols=new Float32Array(n*3);geo.setAttribute('color',new THREE.BufferAttribute(cols,3));
      var p=new THREE.Points(geo,new THREE.PointsMaterial({size:size||.06,vertexColors:true,transparent:true,opacity:.95,depthWrite:false}));return p}
    function lines(geo,op,color){return new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:color||CC,transparent:true,opacity:op,depthWrite:false}))}
    function grid(W,D,n){var g=new THREE.PlaneGeometry(W,D,n,Math.round(n*D/W));g.rotateX(-Math.PI/2);return g}
    var G=new THREE.Group();S.add(G);var update;

    /* Natural disasters: terrain with an advancing fire front (isochrone) */
    function terrainH(x,z){return 1.5*Math.sin(x*.35+1.3)*Math.cos(z*.42)+.8*Math.sin(x*.9+z*.6)+.35*Math.sin(x*2.1-z*1.7)+.9*Math.exp(-((x-3)*(x-3)+(z+2)*(z+2))/10)}
    function terrain(mode){
      var W=22,D=16,g=grid(W,D,90),P=g.attributes.position,base=new Float32Array(P.count);
      for(var i=0;i<P.count;i++){base[i]=terrainH(P.getX(i),P.getZ(i));P.setY(i,base[i])}
      var p=pts(g),cols=g.attributes.color.array;G.add(p);G.add(lines(new THREE.WireframeGeometry(g),.07));
      var water=null;
      if(mode==='flood'){var wg=grid(W,D,60);water=pts(wg,.075);var wc=wg.attributes.color.array,bl=new THREE.Color('#5fb4ff');for(var j=0;j<wg.attributes.position.count;j++){wc[j*3]=bl.r;wc[j*3+1]=bl.g;wc[j*3+2]=bl.b}G.add(water)}
      update=function(t){
        if(mode==='fire'){var fx=((t*1.6)%(W+8))-W/2-4;
          for(var i=0;i<P.count;i++){var x=P.getX(i),z=P.getZ(i),d=fx-(x+Math.sin(z*.7)*1.2),k=Math.exp(-d*d*1.6);mix(0,(d>0?.35:0)+k*1.4,cols,i)}}
        else if(mode==='flood'){var lv=-1.3+2.4*(.5-.5*Math.cos(t*.45)),WP=water.geometry.attributes.position;
          for(var j=0;j<WP.count;j++)WP.setY(j,lv+.12*Math.sin(WP.getX(j)*.8+t*1.8)+.08*Math.sin(WP.getZ(j)*1.3-t*1.3));WP.needsUpdate=true;
          for(var i=0;i<P.count;i++){var dd=base[i]-lv;mix(0,dd<0?.06:.25+Math.exp(-dd*dd*6)*1.2,cols,i)}}
        else{for(var i=0;i<P.count;i++){var x=P.getX(i),z=P.getZ(i),d=((t*1.4)%(D+6))-D/2-3-z;P.setY(i,base[i]+.06*Math.sin(t*.8+x*.5+z*.4));mix(0,.2+Math.exp(-d*d*1.6)*1.2,cols,i)}P.needsUpdate=true}
        g.attributes.color.needsUpdate=true}
    }

    /* Safety management: tank farm with pipe rack and an expanding consequence zone */
    function plant(){
      var gg=grid(24,16,60),gc=pts(gg,.05),gcol=gg.attributes.color.array,GP=gg.attributes.position;G.add(gc);
      var tanks=[[-5,-2.5,1.5,2.2],[-1.2,-3.6,1.9,2.8],[2.8,-2.2,1.4,2],[-3.2,1.6,1.1,1.5],[1,1.2,1.3,1.8],[5.4,1.8,1.6,2.3]];
      tanks.forEach(function(T){var cg=new THREE.CylinderGeometry(T[2],T[2],T[3],36,5,true);cg.translate(T[0],T[3]/2,T[1]);
        G.add(lines(new THREE.WireframeGeometry(cg),.22));var cp=pts(cg,.07),cc=cg.attributes.color.array;for(var i=0;i<cg.attributes.position.count;i++)mix(0,.9,cc,i);G.add(cp);
        var rim=new THREE.EdgesGeometry(new THREE.CircleGeometry(T[2],36));rim.rotateX(-Math.PI/2);rim.translate(T[0],T[3],T[1]);G.add(lines(rim,.6))});
      var rack=[];[[-5,-2.5],[-1.2,-3.6],[2.8,-2.2],[5.4,1.8],[1,1.2],[-3.2,1.6],[-5,-2.5]].forEach(function(p,i,a){if(i){rack.push(new THREE.Vector3(a[i-1][0],.9,a[i-1][1]),new THREE.Vector3(p[0],.9,p[1]))}});
      G.add(lines(new THREE.BufferGeometry().setFromPoints(rack),.35));
      G.scale.set(.72,.72,.72);G.position.set(.6,0,-1.5);var src=tanks[1],rings=[0,1].map(function(){var r=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:97},function(_,i){var a=i/96*Math.PI*2;return new THREE.Vector3(Math.cos(a),.05,Math.sin(a))})),new THREE.LineBasicMaterial({color:CC,transparent:true,opacity:.8}));r.position.set(src[0],0,src[1]);G.add(r);return r});
      update=function(t){var rs=[];rings.forEach(function(r,k){var ph=((t*.35)+k*.5)%1,rad=1.9+ph*9;r.scale.set(rad,1,rad);r.material.opacity=.85*(1-ph);rs.push([rad,1-ph])});
        for(var i=0;i<GP.count;i++){var dx=GP.getX(i)-src[0],dz=GP.getZ(i)-src[1],d=Math.sqrt(dx*dx+dz*dz),k=.15;rs.forEach(function(q){var e=d-q[0];k+=Math.exp(-e*e*2)*q[1]*1.2+(d<q[0]?.08*q[1]:0)});mix(0,k,gcol,i)}
        gg.attributes.color.needsUpdate=true}
    }

    /* Risk control platforms: modular layers of nodes, data pulses between them */
    function net(){
      var layers=[-1.8,0,1.8],nodes=[];
      layers.forEach(function(y,li){var row=[];for(var a=0;a<7;a++)for(var b=0;b<5;b++)row.push(new THREE.Vector3(-7.5+a*2.5+(rnd()-.5)*.8,y,-5+b*2.4+(rnd()-.5)*.8));nodes.push(row);
        var pl=new THREE.PlaneGeometry(19,12,19,12);pl.rotateX(-Math.PI/2);pl.translate(0,y-.02,-.2);G.add(lines(new THREE.WireframeGeometry(pl),.05+li*.015))});
      var all=[].concat.apply([],nodes),ng=new THREE.BufferGeometry().setFromPoints(all),np=pts(ng,.16),nc=ng.attributes.color.array;G.add(np);
      var links=[];for(var l=0;l<2;l++)nodes[l].forEach(function(n){var cand=nodes[l+1].slice().sort(function(p,q){return p.distanceTo(n)-q.distanceTo(n)});links.push([n,cand[0]],[n,cand[1]])});
      nodes.forEach(function(row){row.forEach(function(n,i){var q=row[i+5];if(q&&rnd()<.6)links.push([n,q])})});
      var lp=[];links.forEach(function(k){lp.push(k[0],k[1])});G.add(lines(new THREE.BufferGeometry().setFromPoints(lp),.28));
      var NP=46,pul=new Float32Array(NP*3),pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pul,3));
      var pm=new THREE.Points(pg,new THREE.PointsMaterial({color:new THREE.Color('#ffffff').lerp(CC,.35),size:.2,transparent:true,opacity:.95,depthWrite:false}));G.add(pm);
      var st=[];for(var i=0;i<NP;i++)st.push({l:Math.floor(rnd()*links.length),o:rnd(),s:.25+rnd()*.5});
      update=function(t){for(var i=0;i<NP;i++){var q=st[i],k=links[q.l],f=(q.o+t*q.s)%1;var v=k[0].clone().lerp(k[1],f);pul[i*3]=v.x;pul[i*3+1]=v.y;pul[i*3+2]=v.z;if(f<.02)q.l=Math.floor(rnd()*links.length)}
        pg.attributes.position.needsUpdate=true;
        for(var j=0;j<all.length;j++)mix(0,.7+.5*Math.sin(t*1.5+j*1.7),nc,j);ng.attributes.color.needsUpdate=true;G.rotation.y=Math.sin(t*.12)*.25}
    }

    /* Training: an evacuation drill, people moving to the assembly points */
    function muster(){
      var gg=grid(24,16,48),gp=pts(gg,.04),gc=gg.attributes.color.array;for(var i=0;i<gg.attributes.position.count;i++)mix(0,.2,gc,i);G.add(gp);
      var AP=[new THREE.Vector3(-2.8,0,3.6),new THREE.Vector3(5.2,0,2.4)];G.position.set(2.6,0,-1)
      AP.forEach(function(a){var r=new THREE.EdgesGeometry(new THREE.CircleGeometry(1.1,40));r.rotateX(-Math.PI/2);r.translate(a.x,.03,a.z);G.add(lines(r,.8));
        var m=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x,0,a.z),new THREE.Vector3(a.x,2.2,a.z)]);G.add(lines(m,.7))});
      var bld=new THREE.BoxGeometry(4,1.6,2.6);bld.translate(1,.8,-3);G.add(lines(new THREE.EdgesGeometry(bld),.3));
      var N=320,pos=new Float32Array(N*3),hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(pos,3));
      var hp=pts(hg,.15),hc=hg.attributes.color.array;G.add(hp);
      var P0=[],T=[],SP=[];for(var i=0;i<N;i++){var x=1+(rnd()-.5)*3.6,z=-3+(rnd()-.5)*2.2,y=.1+rnd()*1.4;P0.push(new THREE.Vector3(x,y,z));T.push(AP[x<1?0:1].clone().add(new THREE.Vector3((rnd()-.5)*1.6,.08,(rnd()-.5)*1.6)));SP.push(.55+rnd()*.6)}
      update=function(t){var cyc=13,ph=(t%cyc)/cyc,k=Math.max(0,Math.min(1,(ph-.08)/.7));
        for(var i=0;i<N;i++){var f=Math.min(1,k*SP[i]*1.35),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,a=P0[i],b=T[i];
          var mx=(a.x+b.x)/2,mz=(a.z+b.z)/2+(i%2?1.2:-1.2);var u=1-e;
          pos[i*3]=u*u*a.x+2*u*e*mx+e*e*b.x;pos[i*3+1]=a.y*u+b.y*e;pos[i*3+2]=u*u*a.z+2*u*e*mz+e*e*b.z;mix(0,f>=1?1.1:.55+e*.4,hc,i)}
        hp.material.opacity=ph>.93?(1-ph)/.07:Math.min(1,ph/.04);hg.attributes.position.needsUpdate=true;hg.attributes.color.needsUpdate=true}
    }

    /* About and contact: a globe with Cyprus marked */
    function globe(){
      var N=1600,a=[];for(var i=0;i<N;i++){var y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),th=i*2.399963;a.push(new THREE.Vector3(Math.cos(th)*r*4.2,y*4.2,Math.sin(th)*r*4.2))}
      var g=new THREE.BufferGeometry().setFromPoints(a),p=pts(g,.07),gc=g.attributes.color.array;var B=new THREE.Group();B.add(p);G.add(B);B.position.set(1.2,1.2,-1.5);
      var lat=35*Math.PI/180,lon=70*Math.PI/180,cy=new THREE.Vector3(Math.cos(lat)*Math.cos(lon)*4.2,Math.sin(lat)*4.2,Math.cos(lat)*Math.sin(lon)*4.2);
      for(var i=0;i<N;i++)mix(0,.3+Math.exp(-a[i].distanceToSquared(cy)*.25)*1.2,gc,i);
      var rings=[0,1,2].map(function(k){var r=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:49},function(_,i){var q=i/48*Math.PI*2;return new THREE.Vector3(Math.cos(q),Math.sin(q),0)})),new THREE.LineBasicMaterial({color:CC,transparent:true,opacity:.8}));r.position.copy(cy.clone().multiplyScalar(1.01));r.lookAt(cy.clone().multiplyScalar(2));B.add(r);return r});
      
      update=function(t){B.rotation.y=Math.sin(t*.15)*.3;rings.forEach(function(r,k){var ph=(t*.5+k/3)%1,s=.15+ph*1.4;r.scale.set(s,s,s);r.material.opacity=.9*(1-ph)})}
    }

    ({fire:function(){terrain('fire')},flood:function(){terrain('flood')},terrain:function(){terrain('scan')},plant:plant,net:net,muster:muster,globe:globe}[fx]||function(){terrain('scan')})();

    function size(){var w=c.clientWidth,hh=c.clientHeight;if(!w||!hh)return;R.setSize(w,hh,false);C.aspect=w/hh;C.updateProjectionMatrix()}
    size();addEventListener('resize',size);
    var mx=0,my=0;addEventListener('pointermove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
    var vis=true;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(hero);
    var t0=performance.now();
    function frame(now){requestAnimationFrame(frame);if(!vis||document.hidden)return;var t=(now-t0)/1000;update(t);
      S.rotation.y=-.35+mx*.25+Math.sin(t*.1)*.05;S.rotation.x=my*.08;R.render(S,C)}
    requestAnimationFrame(frame);setTimeout(function(){c.classList.add('on')},60);
  });
})();
