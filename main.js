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
