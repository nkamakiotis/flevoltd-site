/* Training page: 3D walkthrough of a scenario-based training session (Three.js). */
(function(){
  var root=document.getElementById('tsim');if(!root)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var btns=[].slice.call(root.querySelectorAll('.ts-step')),capN=root.querySelector('.ts-cap .n'),capH=root.querySelector('.ts-cap h3'),capP=root.querySelector('.ts-cap p');
  var TXT=[].slice.call(root.querySelectorAll('.ts-data li')).map(function(li){return {h:li.getAttribute('data-h'),p:li.textContent}});
  var DUR=[5,5.5,6.5,6.5,6],START=[],tot=0;DUR.forEach(function(d){START.push(tot);tot+=d});
  var cur=-1;
  function setStep(i,p){if(i!==cur){cur=i;btns.forEach(function(b,k){b.classList.toggle('on',k===i);b.setAttribute('aria-pressed',k===i)});capN.textContent='0'+(i+1);capH.textContent=TXT[i].h;capP.textContent=TXT[i].p;root.querySelector('.ts-cap').classList.remove('in');void root.offsetWidth;root.querySelector('.ts-cap').classList.add('in')}
    btns.forEach(function(b,k){b.style.setProperty('--p',k<i?1:k===i?p:0)})}
  var jump=null;btns.forEach(function(b,k){b.addEventListener('click',function(){jump=k;if(reduce)setStep(k,1)})});
  setStep(0,reduce?1:0);
  if(reduce)return;
  function boot(){if(window.THREE)return init();var ex=document.querySelector('script[src*="three.min.js"]');
    if(ex){var n=0,iv=setInterval(function(){if(window.THREE){clearInterval(iv);init()}else if(++n>100)clearInterval(iv)},100)}
    else{var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.onload=init;document.head.appendChild(s)}}
  function init(){
    var c=root.querySelector('canvas'),R;try{R=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true})}catch(e){return}
    R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    var S=new THREE.Scene(),C=new THREE.PerspectiveCamera(40,1,.1,200);
    var ACC=new THREE.Color(getComputedStyle(document.body).getPropertyValue('--acc').trim()||'#ff5ad1'),WHITE=new THREE.Color('#f4f1ea'),AMB=new THREE.Color('#ffae2b'),RED=new THREE.Color('#ff4a2b'),DIM=ACC.clone().multiplyScalar(.22);
    function L(geo,col,op){return new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false}))}
    function ease(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
    /* ground */
    var gg=new THREE.PlaneGeometry(28,20,70,50);gg.rotateX(-Math.PI/2);
    var gp=new THREE.Points(gg,new THREE.PointsMaterial({color:DIM,size:.05,transparent:true,opacity:.9}));S.add(gp);
    /* site */
    var site=new THREE.Group();S.add(site);var siteMats=[];
    function add(o){site.add(o);siteMats.push(o.material);return o}
    var TANKS=[[-5,-3.2,1.4,2],[0,-3.6,1.7,2.5],[4.6,-2.8,1.25,1.8]];
    TANKS.forEach(function(T){var g=new THREE.CylinderGeometry(T[2],T[2],T[3],32,4,true);g.translate(T[0],T[3]/2,T[1]);add(L(new THREE.WireframeGeometry(g),ACC,.35));
      var r=new THREE.EdgesGeometry(new THREE.CircleGeometry(T[2],32));r.rotateX(-Math.PI/2);r.translate(T[0],T[3],T[1]);add(L(r,ACC,.8))});
    var b=new THREE.BoxGeometry(5,1.8,3);b.translate(-5,.9,3);add(L(new THREE.EdgesGeometry(b),WHITE,.55));
    var b2=new THREE.BoxGeometry(2.6,1.2,2);b2.translate(1.5,.6,3.4);add(L(new THREE.EdgesGeometry(b2),WHITE,.4));
    var rack=[];[[-5,-3.2],[0,-3.6],[4.6,-2.8]].forEach(function(p,i,a){if(i)rack.push(new THREE.Vector3(a[i-1][0],1,a[i-1][1]),new THREE.Vector3(p[0],1,p[1]))});
    rack.push(new THREE.Vector3(-5,1,-3.2),new THREE.Vector3(-5,1,1.5));add(L(new THREE.BufferGeometry().setFromPoints(rack),WHITE,.35));
    var MP=new THREE.Vector3(7.6,0,3.6);
    var mr=new THREE.EdgesGeometry(new THREE.CircleGeometry(1.3,40));mr.rotateX(-Math.PI/2);mr.translate(MP.x,.03,MP.z);add(L(mr,WHITE,.8));
    var mpole=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(MP.x,0,MP.z),new THREE.Vector3(MP.x,2.4,MP.z)]);add(L(mpole,WHITE,.8));
    /* leak cloud */
    var LK=new THREE.Vector3(0,0,-3.6),NC=900,cp=new Float32Array(NC*3),cc=new Float32Array(NC*3),cg=new THREE.BufferGeometry(),CA=[],CR=[],CH=[];
    for(var i=0;i<NC;i++){CA.push(Math.random()*Math.PI*2);CR.push(Math.pow(Math.random(),.6));CH.push(Math.random());var k=Math.random();var col=AMB.clone().lerp(RED,k*.7);cc[i*3]=col.r;cc[i*3+1]=col.g;cc[i*3+2]=col.b}
    cg.setAttribute('position',new THREE.BufferAttribute(cp,3));cg.setAttribute('color',new THREE.BufferAttribute(cc,3));
    var cloud=new THREE.Points(cg,new THREE.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));S.add(cloud);
    var alarm=[0,1,2].map(function(){var r=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:65},function(_,i){var a=i/64*Math.PI*2;return new THREE.Vector3(Math.cos(a),.05,Math.sin(a))})),new THREE.LineBasicMaterial({color:RED,transparent:true,opacity:0}));r.position.copy(LK);S.add(r);return r});
    /* team */
    var TEAM=[];var starts=[[-6.2,4.8],[-5.4,4.9],[-4.6,4.8],[-3.8,4.9],[-6,5.6],[-5.1,5.7],[-4.2,5.6],[-3.3,5.6]];
    var ends=[[-3.4,-.6],[-2.2,-.2],[-3.9,.6],[MP.x-.6,MP.z-.4],[MP.x+.4,MP.z-.6],[MP.x-.3,MP.z+.5],[MP.x+.6,MP.z+.3],[MP.x,MP.z]];
    var vias=[[-5.5,1.5],[-4.5,1.2],[-6.2,1.4],[-1,5.8],[0,6],[1,6.2],[2,6],[3,6.1]];
    var score=[.82,.64,.91,.73,.88,.58,.79,.95];
    starts.forEach(function(s,i){var a=new THREE.Vector3(s[0],0,s[1]),v=new THREE.Vector3(vias[i][0],0,vias[i][1]),e=new THREE.Vector3(ends[i][0],0,ends[i][1]);
      var curve=new THREE.QuadraticBezierCurve3(a,v,e),pts=curve.getPoints(60);
      var g=new THREE.Group();var body=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.75,0)]);g.add(L(body,WHITE,.95));
      var head=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),new THREE.MeshBasicMaterial({color:i<3?ACC:WHITE}));head.position.y=.9;g.add(head);
      var ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:25},function(_,k){var q=k/24*Math.PI*2;return new THREE.Vector3(Math.cos(q)*.3,.02,Math.sin(q)*.3)})),new THREE.LineBasicMaterial({color:ACC,transparent:true,opacity:.8}));g.add(ring);
      S.add(g);
      var tg=new THREE.BufferGeometry().setFromPoints(pts.map(function(p){return new THREE.Vector3(p.x,.04,p.z)}));var trail=new THREE.Line(tg,new THREE.LineDashedMaterial({color:i<3?ACC:WHITE,dashSize:.25,gapSize:.15,transparent:true,opacity:0}));trail.computeLineDistances();S.add(trail);
      var flag=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:33},function(_,k){var q=k/32*Math.PI*2;return new THREE.Vector3(Math.cos(q),.03,Math.sin(q))})),new THREE.LineBasicMaterial({color:ACC,transparent:true,opacity:0}));flag.position.copy(e);S.add(flag);
      var bar=new THREE.Mesh(new THREE.BoxGeometry(.32,1,.32),new THREE.MeshBasicMaterial({color:i<3?ACC:WHITE,transparent:true,opacity:.0}));bar.position.set(e.x+.45,0,e.z);S.add(bar);
      var barE=L(new THREE.EdgesGeometry(new THREE.BoxGeometry(.32,1,.32)),i<3?ACC:WHITE,0);bar.add(barE);
      TEAM.push({g:g,curve:curve,trail:trail,flag:flag,bar:bar,barE:barE,delay:(i<3?0:.35)+i*.05,sc:score[i],end:e})});
    /* camera keyframes per step */
    var CAM=[[new THREE.Vector3(13,10,15),new THREE.Vector3(0,0,0)],[new THREE.Vector3(6,5.5,8),new THREE.Vector3(0,.6,-2.5)],[new THREE.Vector3(1,9.5,14),new THREE.Vector3(0,0,.6)],[new THREE.Vector3(.01,21,1.5),new THREE.Vector3(0,0,.4)],[new THREE.Vector3(-11,6.5,12),new THREE.Vector3(0,.8,.6)]];
    var cpos=CAM[0][0].clone(),clook=CAM[0][1].clone();
    function size(){var w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix();C.zoom=w<640?.5:1;C.updateProjectionMatrix()}
    size();addEventListener('resize',size);
    var vis=false;new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.15}).observe(root);
    var T=0,last=performance.now();
    function frame(now){requestAnimationFrame(frame);var dt=Math.min(.05,(now-last)/1000);last=now;if(!vis||document.hidden)return;
      if(jump!==null){T=START[jump]+.001;jump=null}else T=(T+dt)%tot;
      var st=0;while(st<4&&T>=START[st+1])st++;var lt=T-START[st],p=lt/DUR[st];setStep(st,p);
      /* camera */
      var k=ease(lt/1.8),from=CAM[(st+4)%5],to=CAM[st];if(st===0&&T<1.8)from=CAM[4];
      var orb=Math.sin(T*.25)*.6;
      cpos.copy(from[0]).lerp(to[0],k);cpos.x+=orb;clook.copy(from[1]).lerp(to[1],k);C.position.copy(cpos);C.lookAt(clook);
      /* site build-in */
      var bi=st===0?ease(lt/2.6):1;site.scale.set(1,Math.max(.001,bi),1);siteMats.forEach(function(m){m.opacity=m.userData.o===undefined?(m.userData.o=m.opacity):m.userData.o;m.opacity=m.userData.o*bi});
      gp.material.opacity=.3+.6*(st===0?ease(lt/1.2):1);
      /* leak: grows in step 2, holds, fades at end */
      var lg=st===0?0:st===1?ease(lt/4.5):1,fade=st===4?1-ease(lt/3):st===3?.55:1;
      cloud.material.opacity=.85*Math.min(1,lg*3)*fade;
      for(var i=0;i<NC;i++){var r=CR[i]*(.4+lg*5.2),a=CA[i]+T*.15*(1-CR[i]);cp[i*3]=LK.x+Math.cos(a)*r*1.25+lg*CR[i]*2.2;cp[i*3+1]=.1+CH[i]*(.3+lg*1.1)*(1-CR[i]*.6);cp[i*3+2]=LK.z+Math.sin(a)*r*.85}
      cg.attributes.position.needsUpdate=true;
      alarm.forEach(function(r,j){var ph=((T*.7)+j/3)%1,on=st===1||st===2?1:0;r.scale.setScalar(.5+ph*4.5);r.material.opacity=on*.9*(1-ph)});
      /* team */
      TEAM.forEach(function(m){var f=st<2?0:st===2?ease((lt-.6-m.delay*3)/4.2):1;var pos=m.curve.getPoint(Math.max(0,Math.min(1,f)));m.g.position.set(pos.x,0,pos.z);
        m.g.visible=st>=0;var arrived=st===2?f>=.999:st>2;
        m.flag.material.opacity=arrived&&st<4?.9*(.5+.5*Math.sin(T*4)):0;m.flag.scale.setScalar(.45+.15*Math.sin(T*4));
        m.trail.material.opacity=st===3?.9*ease(lt/1.5):st===4?.35*(1-ease(lt/2)):st===2?.25:0;
        var bh=st===4?ease((lt-.8)/2.2)*m.sc*2.6:0;m.bar.scale.y=Math.max(.001,bh);m.bar.position.y=bh/2;m.bar.material.opacity=bh>0?.55:0;m.barE.material.opacity=bh>0?.95:0});
      R.render(S,C)}
    requestAnimationFrame(frame);root.classList.add('live');
  }
  boot();
})();
