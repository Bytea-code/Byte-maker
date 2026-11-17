/* =========================================================
   CONSTANTS
   ========================================================= */
const SUPABASE_URL = 'https://dgikbrvrtxddwhngkfpp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hdGwQYIj-7w972Q5i4pUeg_gajAg2LM';
const SB_TABLE = 'creators';
const sb = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const STATUSES = [
  { id:'active',   label:'فعال',           color:'#111111' },
  { id:'collab',   label:'در حال همکاری',  color:'#8b6b42' },
  { id:'lead',     label:'پیشنهاد / سرنخ', color:'#d4a373' },
  { id:'archived', label:'آرشیو',          color:'#a0a0a0' },
];

/* لیست ثابت هشتگ‌ها — فقط از همین‌ها انتخاب می‌شود */
const HASHTAGS = [
  'byte_security','byte_algo','byte_news','byte_history','byte_meme',
  'byte_quote','byte_project','byte_roadmap','byte_glossary','byte_paper',
  'byte_book','byte_challenge','byte_bug','byte_event','byte_python',
  'byte_scratch','byte_web','byte_community','byte_research','byte_fact',
  'byte_trivia','byte_voice','byte_pod','byte_video','byte_clip',
  'byte_tip','byte_poll','byte_tool','byte_webinar','byte_cheatsheet',
];

const DAYS = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];

/* =========================================================
   STATE
   ========================================================= */
let state = {
  creators: [],
  view: 'list',
  currentId: null,
  search: '',
  sort: 'newest',
};

/* =========================================================
   STORAGE & DEMO DATA
   ========================================================= */
async function persist(creator){
  if (!sb) { toast('سوپابیس در دسترس نیست', 'err'); return; }
  const list = creator ? [creator] : state.creators;
  const rows = list.map(c => ({ id:c.id, data:c, updated_at:new Date(c.updatedAt || Date.now()).toISOString() }));
  if (!rows.length) return;
  const { error } = await sb.from(SB_TABLE).upsert(rows);
  if (error) { console.error(error); toast('خطا در ذخیره‌سازی ابری', 'err'); }
}

async function removeCreator(id){
  if (!sb) { toast('سوپابیس در دسترس نیست', 'err'); return; }
  const { error } = await sb.from(SB_TABLE).delete().eq('id', id);
  if (error) { console.error(error); toast('خطا در حذف ابری', 'err'); }
}

async function loadStore(){
  if (!sb) { toast('کتابخانهٔ سوپابیس بارگذاری نشد', 'err'); state.creators = []; return; }
  try {
    const { data, error } = await sb.from(SB_TABLE).select('data');
    if (error) throw error;
    if (data && data.length) { state.creators = data.map(r => r.data).filter(Boolean); return; }
  } catch(e){ console.warn(e); toast('اتصال به سوپابیس برقرار نشد', 'err'); state.creators = []; return; }

  const now = Date.now();
  state.creators = [
    {
      id: uid(), name:'کوروش رضایی', status:'active',
      niche:'ابزار و امنیت', email:'kourosh@example.com', phone:'',
      bio:'معرفی ابزارهای برنامه‌نویسی، امنیت و آموزش پایتون.',
      rating: 5,
      hashtags:['byte_tool','byte_security','byte_python'],
      days:{ byte_tool:'شنبه', byte_security:'شنبه', byte_python:'چهارشنبه' },
      notes:[{ id:uid(), text:'برای معرفی ابزار جدید هفتهٔ شنبه هماهنگ شد.', time: now-86400000 }],
      ideas:[{ id:uid(), text:'ویدیوی معرفی ۵ ابزار کاربردی VS Code', time: now-3600000 }],
      links:[{ id:uid(), title:'کانال یوتیوب', url:'https://youtube.com' }],
      createdAt: now, updatedAt: now
    },
    {
      id: uid(), name:'صدرا کریمی', status:'collab',
      niche:'وب و خبر', email:'sadra@example.com', phone:'',
      bio:'اخبار تکنولوژی، توسعهٔ وب و معرفی پروژه‌های اوپن‌سورس.',
      rating: 4,
      hashtags:['byte_tool','byte_web','byte_news'],
      days:{ byte_tool:'دوشنبه', byte_web:'دوشنبه', byte_news:'دوشنبه' },
      notes:[], ideas:[], links:[], createdAt: now - 100000, updatedAt: now - 100000
    },
    {
      id: uid(), name:'نیلوفر احمدی', status:'active',
      niche:'سرگرمی و ویدیو', email:'niloufar@example.com', phone:'',
      bio:'محتوای سرگرم‌کننده، میم و ویدیوهای کوتاه.',
      rating: 5,
      hashtags:['byte_meme','byte_quote','byte_video'],
      days:{ byte_meme:'جمعه', byte_quote:'جمعه', byte_video:'پنجشنبه' },
      notes:[], ideas:[], links:[], createdAt: now - 200000, updatedAt: now - 200000
    }
  ];
  await persist();
}

/* =========================================================
   UTILS
   ========================================================= */
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function getCreator(id){ return state.creators.find(c => c.id === id); }

function statusOf(id){ return STATUSES.find(s => s.id === id) || STATUSES[0]; }

function avatarGradient(name){
  const colors = ['#111111', '#333333', '#4a4a4a', '#8b6b42', '#d4a373'];
  let h = 0;
  const s = String(name || '?');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % colors.length;
  return colors[h];
}

function initial(name){
  const t = String(name || '').trim();
  return t ? t[0] : '؟';
}

function timeAgo(ts){
  if (!ts) return '';
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'همین حالا';
  if (m < 60) return `${m} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ساعت پیش`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} روز پیش`;
  try {
    return new Date(ts).toLocaleDateString('fa-IR', { year:'numeric', month:'long', day:'numeric' });
  } catch(e){ return ''; }
}

function normalizeUrl(u){
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

function totalTags(){
  return state.creators.reduce((n, c) => n + (c.hashtags?.length || 0), 0);
}

/* =========================================================
   RENDER — LIST
   ========================================================= */
function filteredCreators(){
  let list = [...state.creators];

  const q = state.search.trim().toLowerCase();
  if (q) {
    list = list.filter(c => {
      const hay = [c.name, c.niche, c.bio, c.email, ...(c.hashtags || []), ...(c.notes || []).map(n => n.text), ...(c.ideas || []).map(n => n.text)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  switch (state.sort) {
    case 'oldest': list.sort((a,b) => (a.createdAt||0) - (b.createdAt||0)); break;
    case 'name':   list.sort((a,b) => String(a.name).localeCompare(String(b.name), 'fa')); break;
    case 'rating': list.sort((a,b) => (b.rating||0) - (a.rating||0)); break;
    case 'tags':   list.sort((a,b) => (b.hashtags?.length||0) - (a.hashtags?.length||0)); break;
    default:       list.sort((a,b) => (b.updatedAt||b.createdAt||0) - (a.updatedAt||a.createdAt||0));
  }
  return list;
}

function cardHTML(c, i){
  const s = statusOf(c.status);
  const tags = (c.hashtags || []).slice(0, 3);
  const more = (c.hashtags || []).length - tags.length;
  const stars = '★'.repeat(c.rating || 0) + '☆'.repeat(5 - (c.rating || 0));

  return `
  <article class="card" data-action="open" data-id="${c.id}" style="animation-delay:${Math.min(i*35,300)}ms">
    <div class="card-head">
      <div class="avatar" style="background:${avatarGradient(c.name)}">${esc(initial(c.name))}</div>
      <div class="card-title">
        <h3>${esc(c.name) || 'بدون نام'}</h3>
        <span class="platform-badge">${c.niche ? esc(c.niche) : 'بدون حوزه تعریف‌شده'}</span>
      </div>
      <span class="status-dot" style="--c:${s.color}" title="${esc(s.label)}"></span>
    </div>
    <p class="card-bio">${esc(c.bio) || '<span style="opacity:.5">توضیحی ثبت نشده…</span>'}</p>
    <div class="card-tags">
      ${tags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
      ${more > 0 ? `<span class="tag more">+${more}</span>` : ''}
    </div>
    <div class="card-foot">
      <span class="stars-mini">${stars}</span>
      <span># ${(c.hashtags||[]).length} هشتگ</span>
      <span>📝 ${(c.notes||[]).length + (c.ideas||[]).length}</span>
    </div>
  </article>`;
}

function gridHTML(){
  const list = filteredCreators();
  if (!list.length) {
    const hasAny = state.creators.length > 0;
    return `
    <div class="empty">
      <div class="empty-ico">${hasAny ? '🔍' : '✦'}</div>
      <h3>${hasAny ? 'چیزی پیدا نشد' : 'هنوز کسی اضافه نشده'}</h3>
      <p>${hasAny
        ? 'عبارت جستجو را تغییر بده.'
        : 'اولین تولیدکننده محتوا را اضافه کن و هشتگ‌ها، یادداشت‌ها و ایده‌هایش را ثبت کن.'}</p>
      ${hasAny
        ? '<button class="btn" data-action="clear-filters">پاک کردن فیلترها</button>'
        : '<button class="btn btn-primary" data-action="new">+ افزودن اولین تولیدکننده</button>'}
    </div>`;
  }
  return list.map(cardHTML).join('');
}

function renderList(){
  return `
  <div class="stats fade-in">
    <div class="stat">
      <div class="stat-ico">👥</div>
      <div><b>${state.creators.length}</b><span>تولیدکننده محتوا</span></div>
    </div>
    <div class="stat">
      <div class="stat-ico">#</div>
      <div><b>${totalTags()}</b><span>هشتگ ثبت‌شده</span></div>
    </div>
    <div class="stat">
      <div class="stat-ico">📝</div>
      <div><b>${state.creators.reduce((n,c)=>n+(c.notes?.length||0),0)}</b><span>یادداشت</span></div>
    </div>
    <div class="stat">
      <div class="stat-ico">💡</div>
      <div><b>${state.creators.reduce((n,c)=>n+(c.ideas?.length||0),0)}</b><span>ایده</span></div>
    </div>
  </div>

  <div class="toolbar fade-in">
    <div class="search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="search" type="text" placeholder="جستجو در نام، هشتگ، حوزه، یادداشت…" value="${esc(state.search)}" autocomplete="off">
    </div>
    <select class="sort-select" id="sort">
      <option value="newest" ${state.sort==='newest'?'selected':''}>جدیدترین</option>
      <option value="oldest" ${state.sort==='oldest'?'selected':''}>قدیمی‌ترین</option>
      <option value="name"   ${state.sort==='name'?'selected':''}>الفبا</option>
      <option value="rating" ${state.sort==='rating'?'selected':''}>بیشترین امتیاز</option>
      <option value="tags"   ${state.sort==='tags'?'selected':''}>بیشترین هشتگ</option>
    </select>
  </div>

  <div class="grid fade-in" id="grid-wrap">${gridHTML()}</div>
  `;
}

/* =========================================================
   RENDER — DETAIL
   ========================================================= */
function hashtagPanelHTML(c){
  const tags = c.hashtags || [];
  const days = c.days || {};
  const allTags = [...HASHTAGS, ...tags.filter(t => !HASHTAGS.includes(t))];
  return `
    <section class="panel full" id="ht-panel">
      <div class="panel-head">
        <div class="ic">#</div>
        <h3>هشتگ‌ها و روز انتشار</h3>
        <span class="count">${tags.length}</span>
      </div>
      <p class="hint">روی هر هشتگ بزن تا انتخاب شود؛ بعد روز انتشار همان هشتگ را برای این فرد انتخاب کن.</p>
      <div class="tag-picker">
        ${allTags.map(t => {
          const on = tags.includes(t);
          const day = days[t] || '';
          return `
          <div class="pick ${on ? 'on' : ''}">
            <button type="button" class="pick-name" data-action="toggle-tag" data-id="${c.id}" data-tag="${esc(t)}" title="${on ? 'حذف هشتگ' : 'افزودن هشتگ'}">#${esc(t)}</button>
            ${on ? `
            <select class="pick-day" data-action="set-day" data-id="${c.id}" data-tag="${esc(t)}" title="روز انتشار">
              <option value="" ${!day ? 'selected' : ''}>— روز —</option>
              ${DAYS.map(d => `<option value="${d}" ${d===day ? 'selected' : ''}>${d}</option>`).join('')}
            </select>` : ''}
          </div>`;
        }).join('')}
      </div>
      ${tags.length ? `<div style="margin-top:16px"><button type="button" class="btn btn-sm" data-action="copy-tags" data-id="${c.id}">کپی هشتگ‌ها</button></div>` : ''}
    </section>`;
}

function renderDetail(){
  const c = getCreator(state.currentId);
  if (!c) { state.view = 'list'; return renderList(); }

  const s = statusOf(c.status);
  const notes = [...(c.notes||[])].sort((a,b)=>b.time-a.time);
  const ideas = [...(c.ideas||[])].sort((a,b)=>b.time-a.time);
  const links = c.links || [];

  return `
  <div class="detail-top fade-in">
    <button class="btn" data-action="back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      بازگشت به فهرست
    </button>
    <div style="margin-inline-start:auto;display:flex;gap:10px">
      <button class="btn btn-danger" data-action="delete" data-id="${c.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        حذف
      </button>
    </div>
  </div>

  <div class="detail-hero fade-in">
    <div class="avatar-lg" style="background:${avatarGradient(c.name)}">${esc(initial(c.name))}</div>
    <div class="detail-hero-info">
      <div class="detail-name">${esc(c.name) || 'بدون نام'}</div>
      <div class="detail-meta">
        <span class="pill" style="background:${s.color}15;border-color:${s.color}40;color:${s.color}">
          <span class="status-dot" style="--c:${s.color}"></span> ${esc(s.label)}
        </span>
        ${c.niche ? `<span class="pill">🎯 ${esc(c.niche)}</span>` : ''}
      </div>
      <div class="rating" data-id="${c.id}">
        ${[1,2,3,4,5].map(n => `
          <button data-action="rate" data-id="${c.id}" data-value="${n}" class="${(c.rating||0) >= n ? 'on' : ''}" title="${n} ستاره">★</button>
        `).join('')}
      </div>
    </div>
  </div>

  <div class="detail-grid fade-in">

    <!-- HASHTAGS -->
    ${hashtagPanelHTML(c)}

    <!-- INFO -->
    <section class="panel full">
      <div class="panel-head">
        <div class="ic">👤</div>
        <h3>اطلاعات پایه</h3>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>نام</label>
          <input class="field" data-field="name" data-id="${c.id}" value="${esc(c.name)}" placeholder="نام تولیدکننده">
        </div>
        <div class="info-item">
          <label>وضعیت</label>
          <select class="field" data-field="status" data-id="${c.id}">
            ${STATUSES.map(x => `<option value="${x.id}" ${x.id===c.status?'selected':''}>${esc(x.label)}</option>`).join('')}
          </select>
        </div>
        <div class="info-item">
          <label>حوزه فعالیت</label>
          <input class="field" data-field="niche" data-id="${c.id}" value="${esc(c.niche)}" placeholder="مثلاً گیم، آشپزی…">
        </div>
        <div class="info-item">
          <label>ایمیل</label>
          <input class="field" data-field="email" data-id="${c.id}" value="${esc(c.email)}" placeholder="name@mail.com" dir="ltr" style="text-align:left">
        </div>
        <div class="info-item">
          <label>شماره تماس</label>
          <input class="field" data-field="phone" data-id="${c.id}" value="${esc(c.phone)}" placeholder="۰۹۱۲…" dir="ltr" style="text-align:left">
        </div>
        <div class="info-item wide">
          <label>بیوگرافی / توضیحات</label>
          <textarea class="field" data-field="bio" data-id="${c.id}" placeholder="درباره این تولیدکننده بنویس…">${esc(c.bio)}</textarea>
        </div>
      </div>
    </section>

    <!-- NOTES -->
    <section class="panel">
      <div class="panel-head">
        <div class="ic">📝</div>
        <h3>یادداشت‌ها</h3>
        <span class="count">${notes.length}</span>
      </div>
      <form class="inline-form" data-form="add-note" data-id="${c.id}">
        <input name="text" placeholder="یادداشت جدید…" autocomplete="off">
        <button type="submit" class="btn btn-primary">+</button>
      </form>
      <div class="list">
        ${notes.length
          ? notes.map(n => `
            <div class="list-item">
              <span class="dot"></span>
              <div class="body">
                <div class="text">${esc(n.text)}</div>
                <div class="time">${timeAgo(n.time)}</div>
              </div>
              <button class="del" data-action="del-note" data-id="${c.id}" data-nid="${n.id}" title="حذف">×</button>
            </div>`).join('')
          : '<div class="empty-mini">یادداشتی ثبت نشده</div>'}
      </div>
    </section>

    <!-- IDEAS -->
    <section class="panel">
      <div class="panel-head">
        <div class="ic">💡</div>
        <h3>ایده‌ها</h3>
        <span class="count">${ideas.length}</span>
      </div>
      <form class="inline-form" data-form="add-idea" data-id="${c.id}">
        <input name="text" placeholder="ایده جدید…" autocomplete="off">
        <button type="submit" class="btn btn-primary">+</button>
      </form>
      <div class="list">
        ${ideas.length
          ? ideas.map(n => `
            <div class="list-item">
              <span class="dot" style="background:#d4a373;"></span>
              <div class="body">
                <div class="text">${esc(n.text)}</div>
                <div class="time">${timeAgo(n.time)}</div>
              </div>
              <button class="del" data-action="del-idea" data-id="${c.id}" data-nid="${n.id}" title="حذف">×</button>
            </div>`).join('')
          : '<div class="empty-mini">ایده‌ای ثبت نشده</div>'}
      </div>
    </section>

    <!-- LINKS -->
    <section class="panel full">
      <div class="panel-head">
        <div class="ic">🔗</div>
        <h3>لینک‌ها</h3>
        <span class="count">${links.length}</span>
      </div>
      <form class="inline-form" data-form="add-link" data-id="${c.id}">
        <input name="title" placeholder="عنوان" style="flex:0 0 140px" autocomplete="off">
        <input name="url" placeholder="آدرس لینک…" dir="ltr" style="text-align:left" autocomplete="off">
        <button type="submit" class="btn btn-primary">+</button>
      </form>
      <div class="list">
        ${links.length
          ? links.map(l => `
            <div class="list-item">
              <span class="dot" style="background:#111;"></span>
              <div class="body">
                <a href="${esc(normalizeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.title || l.url)}</a>
              </div>
              <button class="del" data-action="del-link" data-id="${c.id}" data-nid="${l.id}" title="حذف">×</button>
            </div>`).join('')
          : '<div class="empty-mini">لینکی ثبت نشده</div>'}
      </div>
    </section>

  </div>
  `;
}

/* =========================================================
   RENDER — HASHTAG OVERVIEW
   ========================================================= */
function renderHashtags(){
  const dayIndex = d => { const i = DAYS.indexOf(d); return i < 0 ? 99 : i; };
  const rows = HASHTAGS.map(tag => {
    const people = state.creators
      .filter(c => (c.hashtags || []).includes(tag))
      .map(c => ({ id:c.id, name:c.name || 'بدون نام', day:(c.days && c.days[tag]) || '' }))
      .sort((a,b) => dayIndex(a.day) - dayIndex(b.day) || String(a.name).localeCompare(String(b.name), 'fa'));
    return { tag, people };
  });
  const covered = rows.filter(r => r.people.length).length;

  return `
  <div class="detail-top fade-in">
    <button class="btn" data-action="home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      بازگشت به فهرست
    </button>
    <span class="pill" style="margin-inline-start:auto">پوشش: ${covered} از ${HASHTAGS.length} هشتگ</span>
  </div>

  <div class="ht-grid fade-in">
    ${rows.map(r => `
      <article class="ht-card ${r.people.length ? '' : 'empty'}">
        <div class="ht-card-head">
          <span class="ht-name">#${esc(r.tag)}</span>
          <span class="ht-count">${r.people.length ? r.people.length + ' نفر' : '—'}</span>
        </div>
        <div class="ht-people">
          ${r.people.length
            ? r.people.map(p => `<button class="ht-person" data-action="open" data-id="${p.id}" title="باز کردن پروفایل">${esc(p.name)}<b>/${esc(p.day || '—')}</b></button>`).join('')
            : '<span class="ht-none">بدون مسئول</span>'}
        </div>
      </article>`).join('')}
  </div>`;
}

/* =========================================================
   MAIN RENDER
   ========================================================= */
function render(){
  const main = document.getElementById('main');
  main.innerHTML =
    state.view === 'detail'   ? renderDetail()   :
    state.view === 'hashtags' ? renderHashtags() :
    renderList();
  main.classList.remove('fade-in');
  void main.offsetWidth;
  main.classList.add('fade-in');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshGrid(){
  const g = document.getElementById('grid-wrap');
  if (!g) return render();
  g.innerHTML = gridHTML();
}

/* =========================================================
   MODAL
   ========================================================= */
function openModal(html){
  document.getElementById('modal-root').innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">${html}</div>
    </div>`;
}
function closeModal(){
  document.getElementById('modal-root').innerHTML = '';
}

function openNewModal(){
  openModal(`
    <h2>تولیدکننده جدید</h2>
    <form id="new-form">
      <label>نام <span style="color:#d32f2f">*</span></label>
      <input class="field" name="name" required placeholder="مثلاً علی رضایی" autocomplete="off" autofocus>

      <label>حوزه فعالیت</label>
      <input class="field" name="niche" placeholder="مثلاً تکنولوژی، آشپزی، سفر…" autocomplete="off">

      <p class="hint" style="margin-top:14px">هشتگ‌ها و روز انتشار را بعد از ساخت، داخل پروفایل از لیست انتخاب کن.</p>

      <div class="modal-actions">
        <button type="button" class="btn" data-action="close-modal">انصراف</button>
        <button type="submit" class="btn btn-primary">ساخت پروفایل</button>
      </div>
    </form>
  `);
}

function openConfirm(title, text, onYes){
  openModal(`
    <h2>${esc(title)}</h2>
    <p style="font-size:13.5px;color:var(--text-muted);line-height:1.9">${esc(text)}</p>
    <div class="modal-actions">
      <button class="btn" data-action="close-modal">انصراف</button>
      <button class="btn btn-danger" id="confirm-yes" style="background:#d32f2f;color:#fff;border:none">بله، حذف کن</button>
    </div>
  `);
  document.getElementById('confirm-yes').onclick = () => { closeModal(); onYes(); };
}

/* =========================================================
   TOAST
   ========================================================= */
function toast(msg, type = 'ok'){
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span>${type === 'ok' ? '✓' : '!'}</span> ${esc(msg)}`;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, 2400);
}

/* =========================================================
   ACTIONS
   ========================================================= */
function createCreator(data){
  const now = Date.now();
  const c = {
    id: uid(),
    name: (data.name || '').trim(),
    status: 'active',
    niche: (data.niche || '').trim(),
    email: '',
    phone: '',
    bio: '',
    rating: 0,
    hashtags: [],
    days: {},
    notes: [],
    ideas: [],
    links: [],
    createdAt: now,
    updatedAt: now,
  };
  state.creators.unshift(c);
  persist(c);
  return c;
}

function deleteCreator(id){
  state.creators = state.creators.filter(c => c.id !== id);
  removeCreator(id);
  state.view = 'list';
  state.currentId = null;
  render();
  toast('پروفایل حذف شد');
}

/* =========================================================
   EVENT DELEGATION
   ========================================================= */
document.addEventListener('click', (e) => {

  if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
    closeModal();
    return;
  }

  const el = e.target.closest('[data-action]');
  if (!el) return;

  const action = el.dataset.action;
  const id = el.dataset.id;

  switch (action) {
    case 'new':
      openNewModal();
      break;
    case 'hashtags-view':
      state.view = 'hashtags';
      state.currentId = null;
      render();
      break;
    case 'home':
      state.view = 'list';
      state.currentId = null;
      render();
      break;
    case 'close-modal':
      closeModal();
      break;
    case 'open':
      state.view = 'detail';
      state.currentId = id;
      render();
      break;
    case 'back':
      state.view = 'list';
      state.currentId = null;
      render();
      break;
    case 'delete': {
      const c = getCreator(id);
      if (!c) break;
      openConfirm('حذف پروفایل', `آیا مطمئنی می‌خواهی «${c.name || 'بدون نام'}» و همه اطلاعاتش حذف شود؟`, () => deleteCreator(id));
      break;
    }
    case 'clear-filters':
      state.search = '';
      state.sort = 'newest';
      render();
      break;
    case 'toggle-tag': {
      const c = getCreator(id);
      if (!c) break;
      const tag = el.dataset.tag;
      c.hashtags = c.hashtags || [];
      c.days = c.days || {};
      if (c.hashtags.includes(tag)) {
        c.hashtags = c.hashtags.filter(t => t !== tag);
        delete c.days[tag];
      } else {
        c.hashtags.push(tag);
      }
      c.updatedAt = Date.now();
      persist(c);
      const panel = document.getElementById('ht-panel');
      if (panel) panel.outerHTML = hashtagPanelHTML(c);
      break;
    }
    case 'copy-tags': {
      const c = getCreator(id);
      if (!c) break;
      const text = (c.hashtags || []).map(t => '#' + t).join(' ');
      navigator.clipboard?.writeText(text).then(() => toast('هشتگ‌ها کپی شدند')).catch(() => toast('کپی نشد', 'err'));
      break;
    }
    case 'rate': {
      const c = getCreator(id);
      if (!c) break;
      const v = Number(el.dataset.value);
      c.rating = (c.rating === v) ? 0 : v;
      c.updatedAt = Date.now();
      persist(c);
      document.querySelectorAll(`.rating[data-id="${id}"] button`).forEach(b => {
        b.classList.toggle('on', Number(b.dataset.value) <= c.rating);
      });
      break;
    }
    case 'del-note':
    case 'del-idea':
    case 'del-link': {
      const c = getCreator(id);
      if (!c) break;
      const nid = el.dataset.nid;
      const key = action === 'del-note' ? 'notes' : action === 'del-idea' ? 'ideas' : 'links';
      c[key] = c[key].filter(x => x.id !== nid);
      c.updatedAt = Date.now();
      persist(c);
      render();
      break;
    }
    case 'export': {
      const blob = new Blob([JSON.stringify(state.creators, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `creators-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('فایل پشتیبان دانلود شد');
      break;
    }
    case 'import':
      document.getElementById('file-input').click();
      break;
  }
});

/* ---------- submit handlers ---------- */
document.addEventListener('submit', (e) => {
  const form = e.target;
  e.preventDefault();

  if (form.id === 'new-form') {
    const fd = new FormData(form);
    const name = (fd.get('name') || '').trim();
    if (!name) { toast('نام را وارد کن', 'err'); return; }
    const c = createCreator({
      name,
      niche: fd.get('niche'),
    });
    closeModal();
    state.view = 'detail';
    state.currentId = c.id;
    render();
    toast('پروفایل ساخته شد');
    return;
  }

  const type = form.dataset.form;
  if (!type) return;
  const c = getCreator(form.dataset.id);
  if (!c) return;

  if (type === 'add-note' || type === 'add-idea') {
    const input = form.querySelector('input[name="text"]');
    const text = input.value.trim();
    if (!text) return;
    const key = type === 'add-note' ? 'notes' : 'ideas';
    c[key].unshift({ id: uid(), text, time: Date.now() });
    input.value = '';
    c.updatedAt = Date.now();
    persist(c);
    render();
    return;
  }

  if (type === 'add-link') {
    const fd = new FormData(form);
    const url = (fd.get('url') || '').trim();
    if (!url) return;
    const title = (fd.get('title') || '').trim() || url;
    c.links.unshift({ id: uid(), title, url });
    c.updatedAt = Date.now();
    persist(c);
    render();
    return;
  }
});

/* ---------- live input ---------- */
let saveTimer = null;
document.addEventListener('input', (e) => {
  const t = e.target;

  if (t.id === 'search') {
    state.search = t.value;
    refreshGrid();
    return;
  }

  const field = t.dataset.field;
  if (!field) return;
  const c = getCreator(t.dataset.id);
  if (!c) return;

  c[field] = t.value;
  c.updatedAt = Date.now();

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persist(c), 350);

  if (field === 'name') {
    const dn = document.querySelector('.detail-name');
    if (dn) dn.textContent = t.value || 'بدون نام';
    const av = document.querySelector('.avatar-lg');
    if (av) {
      av.textContent = initial(t.value);
      av.style.background = avatarGradient(t.value);
    }
  }
});

/* ---------- change (selects) ---------- */
document.addEventListener('change', (e) => {
  const t = e.target;

  if (t.id === 'sort') {
    state.sort = t.value;
    refreshGrid();
    return;
  }

  if (t.dataset.action === 'set-day') {
    const c = getCreator(t.dataset.id);
    if (!c) return;
    c.days = c.days || {};
    c.days[t.dataset.tag] = t.value;
    c.updatedAt = Date.now();
    persist(c);
    return;
  }

  const field = t.dataset.field;
  if (!field) return;
  const c = getCreator(t.dataset.id);
  if (!c) return;
  c[field] = t.value;
  c.updatedAt = Date.now();
  persist(c);
  if (field === 'status') render();
});

/* ---------- import file ---------- */
document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error('bad');
      const existing = new Set(state.creators.map(c => c.id));
      let added = 0;
      data.forEach(c => {
        if (c && c.id && !existing.has(c.id)) {
          state.creators.push(c);
          added++;
        }
      });
      persist();
      render();
      toast(`${added} پروفایل بازیابی شد`);
    } catch (err) {
      toast('فایل معتبر نیست', 'err');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/* ---------- escape key ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* =========================================================
   INIT
   ========================================================= */
(async () => {
  const main = document.getElementById('main');
  if (main) main.innerHTML = '<div class="empty"><div class="empty-ico">⏳</div><h3>در حال بارگذاری…</h3><p>اتصال به سوپابیس</p></div>';
  await loadStore();
  render();
})();