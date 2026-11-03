/* WanderIQ_Hub: interaksi halaman utama */
(function(){
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var keys=["trip","umkm","tek","volt"];
  var nodes={};document.querySelectorAll(".hub .node").forEach(function(n){nodes[n.dataset.k]=n});

  /* Highlight hub nodes one by one */
  var cur=0;
  function hot(i){keys.forEach(function(k,j){nodes[k]&&nodes[k].classList.toggle("hot",j===i)})}
  hot(0);
  if(!reduce)setInterval(function(){cur=(cur+1)%keys.length;hot(cur)},2600);

  /* Pointer glow on cards */
  document.querySelectorAll(".card").forEach(function(c){
    c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();
      c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px")});
  });

  /* Audience filter */
  var grid=document.getElementById("grid"),chips=document.querySelectorAll(".chip");
  chips.forEach(function(ch){ch.addEventListener("click",function(){
    var on=ch.getAttribute("aria-pressed")!=="true";
    chips.forEach(function(o){o.setAttribute("aria-pressed","false")});
    grid.querySelectorAll(".card").forEach(function(c){c.classList.remove("match")});
    grid.classList.toggle("filtered",on);
    if(on){ch.setAttribute("aria-pressed","true");
      var m=grid.querySelector('.card[data-k="'+ch.dataset.f+'"]');m.classList.add("match");
      if(m.getBoundingClientRect().top>window.innerHeight-120||m.getBoundingClientRect().bottom<0)m.scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"});}
  })});

  /* Feature showcase per card: JS timer rotates highlights every 4.2s and fills the segment bar.
     Runs on every device (also with reduced-motion on, then as a plain crossfade).
     Pauses while the pointer is on the card, the card is offscreen, or the tab is hidden.
     Hovering a segment with a mouse jumps to that feature. */
  var DUR=4200,pad=function(v){return(v<10?"0":"")+v};
  var shows=[];
  document.querySelectorAll(".fx").forEach(function(fx,ci){
    var items=fx.querySelectorAll(".fx-s li"),cnt=fx.querySelector(".fx-n"),N=items.length;
    if(N<2)return;
    var bar=document.createElement("div");bar.className="fx-p";bar.setAttribute("aria-hidden","true");bar.style.setProperty("--n",N);
    var segs=[],fills=[];
    for(var j=0;j<N;j++){var sg=document.createElement("i"),tr=document.createElement("s"),fl=document.createElement("b");
      tr.appendChild(fl);sg.appendChild(tr);bar.appendChild(sg);segs.push(sg);fills.push(fl)}
    fx.appendChild(bar);
    var sh={at:-1,t:-ci*700,hold:false,vis:true};   /* negative start staggers the cards */
    sh.go=function(i){var prev=sh.at;sh.at=i;sh.t=0;
      items.forEach(function(li,k){li.classList.toggle("on",k===i);li.classList.toggle("out",k===prev&&prev!==i)});
      segs.forEach(function(sg,k){sg.classList.toggle("done",k<i);fills[k].style.transform=k<i?"":"scaleX(0)"});
      cnt.innerHTML="<b>"+pad(i+1)+"</b>/"+pad(N)};
    sh.tick=function(dt){if(sh.hold||!sh.vis)return;sh.t+=dt;
      if(sh.t>=DUR){sh.go((sh.at+1)%N);return}
      fills[sh.at].style.transform="scaleX("+Math.max(0,sh.t/DUR)+")"};
    sh.go(0);sh.t=-ci*700;
    var card=fx.closest(".card")||fx;
    card.addEventListener("mouseenter",function(){sh.hold=true});
    card.addEventListener("mouseleave",function(){sh.hold=false});
    segs.forEach(function(sg,k){sg.addEventListener("mouseenter",function(){if(k!==sh.at)sh.go(k)})});
    if("IntersectionObserver" in window)new IntersectionObserver(function(es){sh.vis=es[0].isIntersecting},{threshold:.2}).observe(fx);
    shows.push(sh);
  });
  if(shows.length){var last=0;
    (function loop(now){var dt=last?Math.min(now-last,100):0;last=now;
      if(!document.hidden)shows.forEach(function(sh){sh.tick(dt)});
      requestAnimationFrame(loop)})(0);}

  /* Public stats per app. Each card shows users and rating once the API returns that app's key
     (keys: "trip", "umkm", "teknergi", "volta-z"). Cards without data stay clean. */
  var STATS_URL="https://listrik-budget-api.admin-wanderiq.workers.dev/api/public/stats";
  var n=function(v){v=Number(v);return isFinite(v)&&v>=0?v.toLocaleString("id-ID"):"–"};
  function show(d){if(!d||typeof d!=="object")return;
    document.querySelectorAll(".sts[data-app]").forEach(function(el){var st=d[el.dataset.app];if(!st)return;var ok=false;
      if(st.users){el.querySelector(".su").textContent=n(st.users);ok=true}
      if(st.ratingCount){el.querySelector(".sr").textContent=n(st.ratingAvg)+" ("+n(st.ratingCount)+")";ok=true}
      if(ok)el.hidden=false;});}
  try{show(JSON.parse(localStorage.getItem("hub-stats")||"null"))}catch(e){}
  fetch(STATS_URL).then(function(r){return r.json()}).then(function(d){show(d);try{localStorage.setItem("hub-stats",JSON.stringify(d))}catch(e){}}).catch(function(){});
})();
