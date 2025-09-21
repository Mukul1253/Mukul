// -------- Router (hash-based) --------
const routes = {
  '/forecast': 'page-forecast',
  '/planner':  'page-planner',
  '/sources':  'page-sources',
  '/tips':     'page-tips'
};
function setActiveNav(hashPath){
  const links = document.querySelectorAll('.nav-link');
  links.forEach(a => a.classList.remove('active'));
  const active = Array.from(links).find(a => a.getAttribute('href') === '#'+hashPath);
  if(active) active.classList.add('active');
}
function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
  const el = document.getElementById(id);
  if(el){
    el.classList.add('show');
    if(id === 'page-forecast') revealCards(true);
    if(id === 'page-planner') refreshPlannerSummary();
  }
}
function router(){
  const hash = location.hash || '#/forecast';
  const path = hash.replace('#','');
  const pageId = routes[path] || routes['/forecast'];
  showPage(pageId);
  setActiveNav(path);
}
window.addEventListener('hashchange', router);
// Initialize default route
if(!location.hash){ location.hash = '#/forecast'; }
router();

// -------- Forecast Page Logic --------
const sampleCities = [
  "Seattle, WA", "Miami, FL", "Chicago, IL", "Phoenix, AZ", "New York, NY", "Denver, CO", "San Francisco, CA"
];

const cityDefaults = {
  "Seattle, WA":"rainy",
  "Miami, FL":"sunny",
  "Chicago, IL":"windy",
  "Phoenix, AZ":"heat",
  "New York, NY":"auto",
  "Denver, CO":"sunny",
  "San Francisco, CA":"breezy"
};

const scenarios = {
  sunny: () => ({ temp: randomBetween(20, 27), rain: randomBetween(0, 0.5), wind: randomBetween(3, 12), humid: randomBetween(30, 55) }),
  rainy: () => ({ temp: randomBetween(11, 18), rain: randomBetween(6, 16), wind: randomBetween(18, 35), humid: randomBetween(80, 95) }),
  heat:  () => ({ temp: randomBetween(32, 40), rain: randomBetween(0, 1),  wind: randomBetween(5, 18),  humid: randomBetween(25, 45) }),
  cold:  () => ({ temp: randomBetween(-6, 4),  rain: randomBetween(0, 2),  wind: randomBetween(8, 20),  humid: randomBetween(40, 70) }),
  breezy:() => ({ temp: randomBetween(16, 23), rain: randomBetween(0, 1),  wind: randomBetween(15, 26), humid: randomBetween(40, 60) }),
  windy: () => ({ temp: randomBetween(14, 22), rain: randomBetween(0, 2),  wind: randomBetween(26, 40), humid: randomBetween(45, 65) }),
  auto:  () => ({ temp: randomBetween(15, 26), rain: randomBetween(0, 3),  wind: randomBetween(5, 20),  humid: randomBetween(35, 65) })
};
function randomBetween(min, max){ return +(Math.random() * (max - min) + min).toFixed(1); }

// UI refs (forecast)
const form = document.getElementById('queryForm');
const locationInput = document.getElementById('location');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const scenarioSelect = document.getElementById('scenario');
const randomBtn = document.getElementById('randomBtn');
const suggestions = document.getElementById('suggestions');

const overallEmoji = document.getElementById('overallEmoji');
const overallTitle = document.getElementById('overallTitle');
const overallText  = document.getElementById('overallText');
const riskBar      = document.getElementById('riskBar');

const tempChip = document.getElementById('tempChip');
const tempText = document.getElementById('tempText');
const rainChip = document.getElementById('rainChip');
const rainText = document.getElementById('rainText');
const windChip = document.getElementById('windChip');
const windText = document.getElementById('windText');
const humidChip= document.getElementById('humidChip');
const humidText= document.getElementById('humidText');

const tempBar = document.getElementById('tempBar');
const rainBar = document.getElementById('rainBar');
const windBar = document.getElementById('windBar');
const humidBar= document.getElementById('humidBar');
const tempVal = document.getElementById('tempVal');
const rainVal = document.getElementById('rainVal');
const windVal = document.getElementById('windVal');
const humidVal= document.getElementById('humidVal');

// Suggestions dropdown
if(locationInput){
  locationInput.addEventListener('input', () => {
    const q = locationInput.value.toLowerCase();
    const list = sampleCities.filter(c => c.toLowerCase().includes(q)).slice(0,5);
    if(!q || list.length === 0){ suggestions.classList.add('hidden'); suggestions.innerHTML=''; return; }
    suggestions.innerHTML = `
      <div class="glass rounded-xl border border-white/10 overflow-hidden">
        ${list.map(item => `<button type="button" class="w-full text-left px-4 py-2 hover:bg-white/10 focus:bg-white/10">${item}</button>`).join('')}
      </div>`;
    suggestions.classList.remove('hidden');
    Array.from(suggestions.querySelectorAll('button')).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        locationInput.value = btn.textContent.trim();
        suggestions.classList.add('hidden');
        const def = cityDefaults[locationInput.value];
        scenarioSelect.value = def ? (['sunny','rainy','heat','cold','breezy','windy'].includes(def) ? def : 'auto') : 'auto';
      });
    });
  });

  document.addEventListener('click', (e)=>{
    if(!suggestions.contains(e.target) && e.target !== locationInput){
      suggestions.classList.add('hidden');
    }
  });
}

// Defaults
setDefaultDateTime();
revealCards(false);

function setDefaultDateTime(){
  if(!dateInput || !timeInput) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,'0');
  const dd = String(now.getDate()).padStart(2,'0');
  const hh = String(now.getHours()).padStart(2,'0');
  const mi = String(now.getMinutes()).padStart(2,'0');
  dateInput.value = `${yyyy}-${mm}-${dd}`;
  timeInput.value = `${hh}:${mi}`;
}

if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const location = locationInput.value.trim() || 'Your Location';
    const scenario = pickScenario(location, scenarioSelect.value);
    const data = generateData(scenario);
    updateUI(location, data);
  });
}

if(randomBtn){
  randomBtn.addEventListener('click', ()=>{
    const city = sampleCities[Math.floor(Math.random() * sampleCities.length)];
    locationInput.value = city;
    const def = cityDefaults[city] || 'auto';
    scenarioSelect.value = ['sunny','rainy','heat','cold','breezy','windy'].includes(def) ? def : 'auto';
    const scenario = pickScenario(city, scenarioSelect.value);
    const data = generateData(scenario);
    updateUI(city, data, true);
  });
}

function pickScenario(location, selected){
  if(selected !== 'auto') return selected;
  const def = cityDefaults[location];
  if(def && def !== 'auto') return def;
  const name = location.toLowerCase();
  if(name.includes('seattle') || name.includes('portland')) return 'rainy';
  if(name.includes('miami') || name.includes('orlando')) return 'sunny';
  if(name.includes('phoenix') || name.includes('vegas')) return 'heat';
  if(name.includes('denver')) return 'breezy';
  if(name.includes('chicago')) return 'windy';
  return 'auto';
}

function generateData(s){
  const fn = scenarios[s] || scenarios.auto;
  return fn();
}

function tempCategory(t){
  if(t <= 5) return {label:'Very Cold ❄️', chip:'bad', note:'Bundle up. Risk of discomfort.'};
  if(t >= 29) return {label:'Very Hot 🌡️', chip:'warn', note:'Hydrate and seek shade.'};
  return {label:'Comfortable', chip:'good', note:'Feels great outside.'};
}
function rainCategory(r){
  if(r > 5) return {label:'Very Wet 🌧️', chip:'bad', note:'Expect frequent rain.'};
  if(r >= 1) return {label:'Moderate', chip:'warn', note:'Pack a light raincoat.'};
  return {label:'Dry', chip:'good', note:'Minimal rain expected.'};
}
function windCategory(w){
  if(w > 25) return {label:'Very Windy 💨', chip:'bad', note:'Secure tents and decor.'};
  if(w >= 10) return {label:'Breezy', chip:'warn', note:'Some gusts possible.'};
  return {label:'Calm', chip:'good', note:'Light air movement.'};
}
function humidCategory(h){
  if(h > 80) return {label:'Very Humid 😓', chip:'bad', note:'Sticky and uncomfortable.'};
  if(h >= 60 || h < 30) return {label:'Moderate', chip:'warn', note:'May feel a bit muggy/dry.'};
  return {label:'Comfortable', chip:'good', note:'Pleasant moisture level.'};
}

function overallRecommendation({temp, rain, wind, humid}){
  let riskScore = 0;
  const t = tempCategory(temp), r = rainCategory(rain), w = windCategory(wind), h = humidCategory(humid);
  [t,r,w,h].forEach(c=>{
    if(c.chip==='bad') riskScore += 40;
    else if(c.chip==='warn') riskScore += 20;
    else riskScore += 5;
  });
  let title, text, emoji;
  if(riskScore >= 80 || r.chip==='bad' || w.chip==='bad'){
    title = 'Consider Indoor Plans';
    text  = 'High weather risk for outdoor events. Reschedule or prepare robust cover.';
    emoji = '🔴';
  }else if(riskScore >= 50){
    title = 'Proceed With Caution';
    text  = 'Mixed conditions. Have backup shade/cover and monitor updates.';
    emoji = '🟠';
  }else{
    title = 'Ready to Celebrate!';
    text  = 'Conditions look favorable. Enjoy your outdoor plans.';
    emoji = '🟢';
  }
  return {riskScore, title, text, emoji};
}

let lastForecastData = null;
let lastForecastLabel = 'Not set yet';

function updateUI(location, data, emphasize=false){
  revealCards(true);

  const tCat = tempCategory(data.temp);
  setChip(tempChip, tCat);
  selectiveText(tempText, `${data.temp.toFixed(1)}°C • ${tCat.note}`);

  const rCat = rainCategory(data.rain);
  setChip(rainChip, rCat);
  selectiveText(rainText, `${data.rain.toFixed(1)} mm expected • ${rCat.note}`);

  const wCat = windCategory(data.wind);
  setChip(windChip, wCat);
  selectiveText(windText, `${data.wind.toFixed(0)} km/h • ${wCat.note}`);

  const hCat = humidCategory(data.humid);
  setChip(humidChip, hCat);
  selectiveText(humidText, `${data.humid.toFixed(0)}% • ${hCat.note}`);

  const overall = overallRecommendation(data);
  overallEmoji.textContent = overall.emoji;
  overallTitle.textContent = overall.title;
  overallText.textContent  = overall.text;
  riskBar.style.width = Math.min(100, Math.max(8, overall.riskScore)) + '%';

  if(!document.body.classList.contains('reduce-visuals')){
    if(overall.emoji==='🔴') playFx('rain');
    else if(overall.emoji==='🟠') playFx('wind');
    else playFx('party');
  }

  tempVal.textContent = data.temp.toFixed(1);
  rainVal.textContent = data.rain.toFixed(1);
  windVal.textContent = data.wind.toFixed(0);
  humidVal.textContent= data.humid.toFixed(0);

  tempBar.style.width  = clamp((data.temp+10)/50*100, 0, 100) + '%';
  rainBar.style.width  = clamp(data.rain/20*100,  0, 100) + '%';
  windBar.style.width  = clamp(data.wind/50*100,  0, 100) + '%';
  humidBar.style.width = clamp(data.humid,        0, 100) + '%';

  tempBar.style.backgroundColor  = colorFromChip(tCat.chip);
  rainBar.style.backgroundColor  = colorFromChip(rCat.chip);
  windBar.style.backgroundColor  = colorFromChip(wCat.chip);
  humidBar.style.backgroundColor = colorFromChip(hCat.chip);

  if(emphasize){ pulse(document.getElementById('overallCard')); }

  // Save latest forecast for planner page
  lastForecastData = { ...data, categories: { tCat, rCat, wCat, hCat }, overall };
  lastForecastLabel = `${location} • ${overall.title} (${overall.emoji})`;
  refreshPlannerSummary();
}

function refreshPlannerSummary(){
  const el = document.getElementById('plannerSummary');
  if(!el) return;
  el.textContent = lastForecastLabel;
}

function revealCards(show){
  document.querySelectorAll('.reveal').forEach(el=>{
    if(show) el.classList.add('show'); else el.classList.remove('show');
  });
}

function setChip(el, cat){
  el.textContent = cat.label;
  el.classList.remove('good','warn','bad');
  el.classList.add(cat.chip);
}

function selectiveText(el, newText){
  if(el.textContent !== newText) el.textContent = newText;
}

function colorFromChip(chip){
  if(chip==='good') return '#34d399';
  if(chip==='warn') return '#f59e0b';
  return '#ef4444';
}

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function pulse(el){
  if(!el) return;
  el.animate([
    { transform:'scale(1)',   boxShadow:'0 0 0 rgba(0,0,0,0)' },
    { transform:'scale(1.015)', boxShadow:'0 10px 30px rgba(0,0,0,.35)' },
    { transform:'scale(1)',   boxShadow:'0 0 0 rgba(0,0,0,0)' }
  ], { duration: 550, easing: 'ease-out' });
}

// Effects: rain, wind, confetti
const fxLayer = document.createElement('div');
fxLayer.setAttribute('aria-hidden','true');
fxLayer.style.position='fixed'; fxLayer.style.inset='0'; fxLayer.style.pointerEvents='none'; fxLayer.style.zIndex='50';
document.body.appendChild(fxLayer);

function makeDrop(){
  const d = document.createElement('div');
  d.style.position='absolute';
  d.style.left = Math.random()*100 + 'vw';
  d.style.top = '-10vh';
  d.style.width='2px'; d.style.height= (10+Math.random()*30) +'vh';
  d.style.background='linear-gradient(180deg, rgba(164,240,255,.9), rgba(36,210,247,.2))';
  d.style.filter='blur(.3px)';
  d.style.animation='rainFall '+(2+Math.random()*1.5)+'s linear forwards';
  return d;
}
function makeGust(){
  const g = document.createElement('div');
  g.textContent='〰';
  g.style.position='absolute';
  g.style.top = (Math.random()*90)+'vh';
  g.style.left='-10vw';
  g.style.fontSize=(14+Math.random()*22)+'px';
  g.style.color='rgba(226,239,255,.35)';
  g.style.animation='windMove '+(4+Math.random()*4)+'s linear forwards';
  return g;
}
function makeConfetti(){
  const c = document.createElement('div');
  c.style.position='absolute';
  c.style.left = Math.random()*100 + 'vw';
  c.style.top = '-10vh';
  c.style.width='8px'; c.style.height='12px';
  c.style.background = `hsl(${Math.floor(Math.random()*360)}, 85%, 65%)`;
  c.style.borderRadius='2px';
  c.style.transform='rotate(0deg)';
  c.style.animation='confetti '+(4+Math.random()*3)+'s ease-in forwards';
  return c;
}
function clearFx(){ fxLayer.innerHTML=''; }
function playFx(kind){
  clearFx();
  const count = 28;
  if(kind==='rain'){ for(let i=0;i<count;i++) fxLayer.appendChild(makeDrop()); }
  if(kind==='wind'){ for(let i=0;i<count/2;i++) fxLayer.appendChild(makeGust()); }
  if(kind==='party'){ for(let i=0;i<count*1.2;i++) fxLayer.appendChild(makeConfetti()); }
  setTimeout(()=>{ clearFx(); }, 5000);
}

// Visuals toggle
const visualsToggle = document.getElementById('visualsToggle');
if(visualsToggle){
  visualsToggle.addEventListener('change', ()=>{
    document.body.classList.toggle('reduce-visuals', visualsToggle.checked);
  });
}

// -------- Planner Page Logic --------
const generatePlanBtn = document.getElementById('generatePlanBtn');
const recList = document.getElementById('recList');
const routeList = document.getElementById('routeList');
const routeStatus = document.getElementById('routeStatus');
const routeMapPath = document.getElementById('routeMapPath');
const routeStart = document.getElementById('routeStart');
const routeEnd = document.getElementById('routeEnd');

function refreshPlannerDefaultsIfNeeded(){
  if(!lastForecastData){
    // Initialize from a sunny default so Planner still works if used first
    const data = scenarios.sunny();
    lastForecastData = { ...data, categories:{
      tCat: tempCategory(data.temp),
      rCat: rainCategory(data.rain),
      wCat: windCategory(data.wind),
      hCat: humidCategory(data.humid)
    }, overall: overallRecommendation(data) };
    lastForecastLabel = `Default • ${lastForecastData.overall.title} (${lastForecastData.overall.emoji})`;
  }
  refreshPlannerSummary();
}

function buildRecommendations(eventType, needs, forecast){
  const recs = [];
  // Base on overall risk
  if(forecast.overall.emoji === '🔴'){
    recs.push('Consider backup indoor space or rental canopy.');
    recs.push('Have towels and non-slip mats at entry points.');
  } else if(forecast.overall.emoji === '🟠'){
    recs.push('Prepare pop-up shade or light rain cover.');
    recs.push('Check forecast again 24 hours before the event.');
  } else {
    recs.push('Green light! Keep water and sunscreen handy.');
  }
  // Temperature
  if(forecast.categories.tCat.label.includes('Hot')) recs.push('Provide hydration and shaded seating.');
  if(forecast.categories.tCat.label.includes('Cold')) recs.push('Add warm beverages and blankets/heat lamps.');
  // Rain
  if(forecast.categories.rCat.chip !== 'good') recs.push('Bring waterproof covers for equipment and decor.');
  // Wind
  if(forecast.categories.wCat.chip !== 'good') recs.push('Secure tents and signage with weights.');
  // Humidity
  if(forecast.categories.hCat.label.includes('Very Humid')) recs.push('Offer cooling towels or fans.');
  if(forecast.categories.hCat.label === 'Moderate') recs.push('Plan a few rest breaks to stay comfy.');
  // Event type specifics
  if(eventType === 'wedding'){ recs.push('Prepare aisle cover and a safe, dry photo spot.'); }
  if(eventType === 'sports'){ recs.push('Mark a gear tent and a shaded bench side.'); }
  if(eventType === 'concert'){ recs.push('Elevate stage area and secure cables from moisture.'); }
  if(eventType === 'picnic'){ recs.push('Pick a grassy area with nearby shelter.'); }
  // Needs
  if(needs.kids) recs.push('Set up a kids corner away from wind and cables.');
  if(needs.accessibility) recs.push('Ensure accessible path from parking to main area.');
  if(needs.shade) recs.push('Place extra shade near seating and food.');
  if(needs.food) recs.push('Keep the food area covered and on stable ground.');

  // De-duplicate and limit to 8
  const uniq = [...new Set(recs)];
  return uniq.slice(0,8);
}

function buildRoute(eventType, needs, forecast){
  // Simple schematic path variants based on wind/rain risk
  const windy = forecast.categories.wCat.chip !== 'good';
  const rainy = forecast.categories.rCat.chip !== 'good';
  const pathWindy = "M20 100 C 40 80, 60 85, 80 70 S 120 40, 140 20";
  const pathCalm  = "M20 100 C 50 90, 70 60, 100 50 S 140 30, 140 20";
  const pathRain  = "M20 100 C 30 95, 60 75, 90 60 S 120 45, 140 20";
  const d = rainy ? pathRain : (windy ? pathWindy : pathCalm);

  routeMapPath.setAttribute('d', d);
  // Animate the path drawing
  const length = routeMapPath.getTotalLength();
  routeMapPath.style.strokeDasharray = length + " " + length;
  routeMapPath.style.strokeDashoffset = length;
  routeMapPath.getBoundingClientRect(); // reflow
  routeMapPath.style.transition = "stroke-dashoffset 1.2s ease-out";
  routeMapPath.style.strokeDashoffset = "0";

  // Move end point a bit for variety
  const end = routeMapPath.getPointAtLength(length);
  routeEnd.setAttribute('cx', end.x);
  routeEnd.setAttribute('cy', end.y);

  // Build steps
  const steps = [];
  steps.push("Start: Parking / Drop-off");
  if(needs.accessibility) steps.push("Take accessible path with minimal slope");
  if(rainy) steps.push("Detour via covered walkway");
  if(windy) steps.push("Avoid open ridge; use tree-lined route");
  steps.push(eventType === 'wedding' ? "Stop: Ceremony aisle (check cover)" :
             eventType === 'concert' ? "Stop: Stage area (cable mats)" :
             eventType === 'sports' ? "Stop: Field entrance (bench shade)" :
                                      "Stop: Picnic spot (near shelter)");
  if(needs.food) steps.push("Stop: Food station (under canopy)");
  if(needs.kids) steps.push("Stop: Kids corner (wind-sheltered)");
  steps.push("Finish: Seating / Main area");

  return steps;
}

function renderList(listEl, items){
  listEl.innerHTML = '';
  items.forEach((txt, i)=>{
    const li = document.createElement('li');
    li.className = "flex items-start gap-2";
    li.innerHTML = `<span class="text-emerald-400 mt-0.5">✓</span><span>${txt}</span>`;
    listEl.appendChild(li);
  });
}

if(generatePlanBtn){
  generatePlanBtn.addEventListener('click', ()=>{
    refreshPlannerDefaultsIfNeeded();
    const eventType = document.getElementById('eventType').value;
    const needs = {
      kids: document.getElementById('needKids').checked,
      accessibility: document.getElementById('needAccessibility').checked,
      shade: document.getElementById('needShade').checked,
      food: document.getElementById('needFood').checked
    };
    const recs = buildRecommendations(eventType, needs, lastForecastData);
    renderList(recList, recs);

    const steps = buildRoute(eventType, needs, lastForecastData);
    routeList.innerHTML = '';
    steps.forEach((s, idx)=>{
      const li = document.createElement('li');
      li.className = "flex items-start gap-2";
      li.innerHTML = `<span class="text-sky-400 mt-0.5">${idx+1}.</span><span>${s}</span>`;
      routeList.appendChild(li);
    });
    routeStatus.textContent = "Route generated from start to finish.";
    // Fun effect when plan generated
    playFx(lastForecastData.overall.emoji === '🟢' ? 'party' : (lastForecastData.overall.emoji === '🟠' ? 'wind' : 'rain'));
  });
}

// Kick off a default forecast view
const initial = scenarios.sunny();
updateUI('Seattle, WA', initial);