(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* menu */
  var b=document.getElementById('menu'),n=document.getElementById('mnav');
  if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
    n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');b.setAttribute('aria-expanded',false)}})}
  /* dual hero: bow-tie and isochrones draw together */
  var split=document.getElementById('split');
  if(split){
    if(!reduce)setTimeout(function(){split.classList.add('go-draw')},300);else split.classList.add('go-draw');
    var svg=document.getElementById('isoArt');
    if(svg){
      var ps=[].slice.call(svg.querySelectorAll('path')),k=ps.length-1,T=5.4,G=0.5,A=window.AREA||[];
      var hc=document.getElementById('hClock'),ha=document.getElementById('hArea');
      function hm(m){return('0'+Math.floor(m/60)).slice(-2)+':'+('0'+(m%60)).slice(-2)}
      ps.forEach(function(p,i){p.setAttribute('pathLength','1');p.style.setProperty('--d',(T*Math.pow(i/k,G)).toFixed(2)+'s')});
      function show(i){if(hc)hc.textContent=hm(390+i*10);if(ha)ha.textContent=i&&A[i]?'Pisak · '+A[i].toFixed(1)+' ha burned':'Pisak · ignition'}
      if(reduce){svg.classList.add('done');show(k)}
      else{var t0=null;function tick(ts){if(t0===null)t0=ts;var e=(ts-t0)/1000,i=Math.min(k,Math.floor(k*Math.pow(Math.min(1,e/T),1/G)));show(i);
        if(e<T+1.3)requestAnimationFrame(tick);else svg.classList.add('done')}
        setTimeout(function(){svg.classList.add('go');requestAnimationFrame(tick)},300)}
    }
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
