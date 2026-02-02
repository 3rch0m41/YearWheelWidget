/* -------------------- DATA -------------------- */

const sabbats = [
  { name:"Yule",      sub:"Winter Solstice", month:12, day:21 },
  { name:"Imbolc",    sub:"Fire of Brigid",  month:2,  day:1  },
  { name:"Ostara",    sub:"Spring Equinox",  month:3,  day:20 },
  { name:"Beltane",   sub:"Fire Festival",   month:5,  day:1  },
  { name:"Litha",     sub:"Summer Solstice", month:6,  day:21 },
  { name:"Lughnasadh",sub:"First Harvest",   month:8,  day:1  },
  { name:"Mabon",     sub:"Autumn Equinox",  month:9,  day:22 },
  { name:"Samhain",   sub:"Veil is Thin",    month:10, day:31 }
];

const zodiac = [
  { name:"Aries",       symbol:"♈︎", start:"03-21", end:"04-19" },
  { name:"Taurus",      symbol:"♉︎", start:"04-20", end:"05-20" },
  { name:"Gemini",      symbol:"♊︎", start:"05-21", end:"06-20" },
  { name:"Cancer",      symbol:"♋︎", start:"06-21", end:"07-22" },
  { name:"Leo",         symbol:"♌︎", start:"07-23", end:"08-22" },
  { name:"Virgo",       symbol:"♍︎", start:"08-23", end:"09-22" },
  { name:"Libra",       symbol:"♎︎", start:"09-23", end:"10-22" },
  { name:"Scorpio",     symbol:"♏︎", start:"10-23", end:"11-21" },
  { name:"Sagittarius", symbol:"♐︎", start:"11-22", end:"12-21" },
  { name:"Capricorn",   symbol:"♑︎", start:"12-22", end:"01-19" },
  { name:"Aquarius",    symbol:"♒︎", start:"01-20", end:"02-18" },
  { name:"Pisces",      symbol:"♓︎", start:"02-19", end:"03-20" }
];

const houses = [
  { num:"I",   sub:"Self" },
  { num:"II",  sub:"Values" },
  { num:"III", sub:"Mind" },
  { num:"IV",  sub:"Home" },
  { num:"V",   sub:"Creativity" },
  { num:"VI",  sub:"Service" },
  { num:"VII", sub:"Partnerships" },
  { num:"VIII",sub:"Transformation" },
  { num:"IX",  sub:"Philosophy" },
  { num:"X",   sub:"Career" },
  { num:"XI",  sub:"Community" },
  { num:"XII", sub:"Spirit" }
];

const seasons = [
  { name:"Winter", sub:"North", start:"12-21", end:"03-19" },
  { name:"Spring", sub:"East",  start:"03-20", end:"06-20" },
  { name:"Summer", sub:"South", start:"06-21", end:"09-21" },
  { name:"Autumn", sub:"West",  start:"09-22", end:"12-20" }
];

const moonPhases = [
  { name:"New Moon",        symbol:"🌑" },
  { name:"Waxing Crescent", symbol:"🌒" },
  { name:"First Quarter",   symbol:"🌓" },
  { name:"Waxing Gibbous",  symbol:"🌔" },
  { name:"Full Moon",       symbol:"🌕" },
  { name:"Waning Gibbous",  symbol:"🌖" },
  { name:"Last Quarter",    symbol:"🌗" },
  { name:"Waning Crescent", symbol:"🌘" }
];

/* -------------------- HELPERS -------------------- */

function dateKey(d){
  return `${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function inRange(key,start,end){
  return start<=end ? (key>=start && key<=end) : (key>=start || key<=end);
}

function findZodiac(d){
  const k=dateKey(d);
  return zodiac.find(z=>inRange(k,z.start,z.end));
}

function findSeason(d){
  const k=dateKey(d);
  return seasons.find(s=>inRange(k,s.start,s.end));
}

function findSabbat(d){
  const year=d.getFullYear();
  const now=d.getTime();
  const list=sabbats.map(s=>{
    let y=s.month===12 && d.getMonth()<11 ? year-1 : year;
    return {...s, date:new Date(y,s.month-1,s.day)};
  });
  let cur=list[0];
  for(const s of list){
    if(s.date<=now && s.date>=cur.date) cur=s;
  }
  if(cur.date>now) cur=list.reduce((a,b)=>a.date>b.date?a:b);
  return cur;
}

function moonPhaseIndex(d){
  const lp=2551443;
  const phase=((d.getTime()/1000)%lp)/lp;
  return Math.floor(phase*8)%8;
}

function createLabel(main,sub,angle,radius,cls){
  const el=document.createElement("div");
  el.className=`label ${cls}`;
  const rad=(angle-90)*Math.PI/180;
  el.style.left=`${50+radius*Math.cos(rad)}%`;
  el.style.top=`${50+radius*Math.sin(rad)}%`;
  el.style.transform=`translate(-50%,-50%) rotate(${angle}deg)`;
  el.innerHTML=`<span class="main">${main}</span><span class="sub">${sub}</span>`;
  return el;
}

/* -------------------- BUILD WHEEL -------------------- */

function buildWheel(){
  const wheel=document.getElementById("wheel");
  wheel.querySelectorAll(".label").forEach(n=>n.remove());
  wheel.querySelectorAll(".section-line").forEach(n=>n.remove());
  document.getElementById("moonGlow").classList.remove("active");

  const now=new Date();
  const z=findZodiac(now);
  const s=findSeason(now);
  const sab=findSabbat(now);
  const moonI=moonPhaseIndex(now);

  const R={
    moon:50,
    sabbats:40,
    zodiac:30,
    houses:22,
    seasons:14,
    core:6
  };

  const offsetNorth = -90; // seasons, sabbats, houses, moon, spokes
  const offsetZodiac = 0;  // Aries at East

  // section lines (12 spokes), aligned to North
  for(let i=0;i<12;i++){
    const line=document.createElement("div");
    line.className="section-line";
    const a=(360/12)*i + offsetNorth;
    line.style.transform=`translateX(-50%) rotate(${a}deg)`;
    wheel.appendChild(line);
  }

  // sabbats (North-aligned)
  sabbats.forEach((sb,i)=>{
    const a=(360/sabbats.length)*i + offsetNorth;
    const d=`${String(sb.month).padStart(2,"0")}-${String(sb.day).padStart(2,"0")}`;
    const L=createLabel(sb.name,`${sb.sub} · ${d}`,a,R.sabbats,"sabbat");
    if(sb.name===sab.name) L.classList.add("active");
    wheel.appendChild(L);
  });

  // zodiac (East-aligned, Aries at East)
  zodiac.forEach((zod,i)=>{
    const a=(360/zodiac.length)*i + offsetZodiac;
    const L=createLabel(`${zod.symbol} ${zod.name}`,`${zod.start} – ${zod.end}`,a,R.zodiac,"zodiac");
    if(zod.name===z.name) L.classList.add("active");
    wheel.appendChild(L);
  });

  // houses (North-aligned)
  houses.forEach((h,i)=>{
    const a=(360/houses.length)*i + offsetNorth;
    const L=createLabel(`House ${h.num}`,h.sub,a,R.houses,"house");
    wheel.appendChild(L);
  });

  // seasons (North-aligned)
  seasons.forEach((sea,i)=>{
    const a=(360/seasons.length)*i + offsetNorth;
    const L=createLabel(sea.name,sea.sub,a,R.seasons,"season");
    if(sea.name===s.name) L.classList.add("active");
    wheel.appendChild(L);
  });

  // moon phases (North-aligned)
  moonPhases.forEach((m,i)=>{
    const a=(360/moonPhases.length)*i + offsetNorth;
    const L=createLabel(m.symbol,m.name,a,R.moon,"moon");
    if(i===moonI){
      L.classList.add("active");
      document.getElementById("moonGlow").classList.add("active");
    }
    wheel.appendChild(L);
  });

  document.getElementById("infoPanel").innerHTML =
    `Today: <strong>${now.toDateString()}</strong><br>
     Sabbat: <strong>${sab.name}</strong> · Season: <strong>${s.name}</strong> · Sun in: <strong>${z.name}</strong>`;
}

buildWheel();

/* -------------------- THEME TOGGLE -------------------- */

document.getElementById("themeToggle").addEventListener("click", () => {
  const enabled = !document.body.classList.contains("dark-altar");
  enableDarkAltarTheme(enabled);
});

function enableDarkAltarTheme(enabled){
  if(enabled){
    document.body.classList.add("dark-altar");
  } else {
    document.body.classList.remove("dark-altar");
  }
}
