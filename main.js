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

  /* Feature showcase per card: rotates highlights. The segment timer drives the rotation
     (animationend), so CSS pauses on hover/offscreen also pause the rotation.
     Hovering a segment jumps to that feature. Reduced motion shows all features as a list. */
  var pad=function(v){return(v<10?"0":"")+v};
  var io="IntersectionObserver" in window?new IntersectionObserver(function(es){
    es.forEach(function(e){e.target.classList.toggle("idle",!e.isIntersecting)})},{threshold:.35}):null;
  document.querySelectorAll(".fx").forEach(function(fx,ci){
    var items=fx.querySelectorAll(".fx-s li"),cnt=fx.querySelector(".fx-n"),N=items.length;
    if(N<2)return;
    if(reduce){fx.classList.add("all");return}
    var bar=document.createElement("div");bar.className="fx-p";bar.setAttribute("aria-hidden","true");bar.style.setProperty("--n",N);
    var segs=[];for(var j=0;j<N;j++){var sg=document.createElement("i");sg.appendChild(document.createElement("s"));bar.appendChild(sg);segs.push(sg)}
    fx.appendChild(bar);
    var at=-1;
    function go(i){if(i===at)return;var prev=at;at=i;
      items.forEach(function(li,j){li.classList.toggle("on",j===i);li.classList.toggle("out",j===prev)});
      segs.forEach(function(sg,j){sg.classList.remove("on");sg.classList.toggle("done",j<i)});
      void segs[i].offsetWidth;segs[i].classList.add("on");
      cnt.innerHTML="<b>"+pad(i+1)+"</b>/"+pad(N);}
    go(0);
    segs[0].firstChild.style.animationDelay=(ci*.6)+"s";   /* stagger cards */
    bar.addEventListener("animationend",function(e){
      if(e.animationName!=="fill")return;e.target.style.animationDelay="";
      if(e.target.parentNode===segs[at])go((at+1)%N)});
    segs.forEach(function(sg,j){sg.addEventListener("pointerenter",function(e){if(e.pointerType==="mouse"){segs[at].firstChild.style.animationDelay="";go(j)}})});
    if(io)io.observe(fx);
  });

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
