'use strict';
const statuses = ['Не розпочато', 'В роботі', 'Готово', 'Потребує оновлення'];
const docs = ['Реєстраційні відомості', 'Податкова звітність', 'Підстава користування приміщенням', 'Комерційні пропозиції на обладнання', 'Підтвердження закупівель', 'Договори з постачальниками'];
const key = 'budap-demo-documents-v1';
let state = docs.map(() => statuses[0]);
try { const saved = JSON.parse(localStorage.getItem(key)); if (Array.isArray(saved) && saved.length === docs.length) state = saved.map(v => statuses.includes(v) ? v : statuses[0]); }
catch { if (document.querySelector('#storage-message')) document.querySelector('#storage-message').textContent = 'Збереження недоступне. Позначки діють до перезавантаження.'; }
function progress() { const n = state.filter(v => v === 'Готово').length; if (document.querySelector('#readiness')) document.querySelector('#readiness').textContent = `${Math.round(n / docs.length * 100)}%`; if (document.querySelector('#ready-count')) document.querySelector('#ready-count').textContent = `${n} із ${docs.length} готово`; if (document.querySelector('#progress')) document.querySelector('#progress').value = n; }
if (document.querySelector('#documents')) docs.forEach((name, i) => {
 const row = document.createElement('div'); row.className = 'doc';
 const label = document.createElement('label'); label.htmlFor = `doc-${i}`; label.textContent = name;
 const select = document.createElement('select'); select.id = label.htmlFor; statuses.forEach(s => select.add(new Option(s,s))); select.value = state[i];
 select.addEventListener('change', () => { state[i] = select.value; progress(); try { localStorage.setItem(key, JSON.stringify(state)); if (document.querySelector('#storage-message')) document.querySelector('#storage-message').textContent = 'Демонстраційні позначки збережено в цьому браузері.'; } catch { if (document.querySelector('#storage-message')) document.querySelector('#storage-message').textContent = 'Збереження недоступне. Позначки зникнуть після перезавантаження.'; } });
 row.append(label, select); document.querySelector('#documents').append(row);
});
progress();
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let programs = [];
function render(filter = 'all') {
 document.querySelector('#programs').innerHTML = programs.filter(p => filter === 'all' || p.type === filter).map(p => {
 const e = Object.fromEntries(Object.entries(p).map(([k,v]) => [k,esc(v)]));
 return `<article class="card"><div class="program-head"><div><span class="pill">${e.tag}</span><h3>${e.name}</h3></div><strong class="amount">${e.amount}</strong></div><div class="two"><div><h4>Офіційні умови</h4><p>${e.terms}</p><h4>Витрати</h4><p>${e.spending}</p></div><div><h4>Попередня оцінка</h4><p class="assessment">${e.assessment}</p><h4>Що уточнити</h4><p>${e.unknown}</p></div></div><details><summary>Банки та строки</summary><p>${e.banks}</p><p>${e.deadline}</p></details><div class="source"><a href="${e.source}">${e.sourceName} ↗</a><span>Перевірка: ${e.checked}</span></div></article>`;
 }).join('');
}
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === b))); render(b.dataset.filter); }));
if (document.querySelector('#programs')) fetch('data/programs.json').then(r => { if (!r.ok) throw Error('Load failed'); return r.json(); }).then(data => { programs = data; render(document.querySelector('[data-filter][aria-pressed="true"]').dataset.filter); }).catch(() => { document.querySelector('#programs').textContent = 'Не вдалося завантажити програми. Оновіть сторінку або повторіть пізніше.'; });

// Оновлюємо огляд після повернення назад або зміни статусів в іншій вкладці.
function refreshState() { try { const saved = JSON.parse(localStorage.getItem(key)); state = Array.isArray(saved) && saved.length === docs.length ? saved.map(v => statuses.includes(v) ? v : statuses[0]) : docs.map(() => statuses[0]); } catch {} progress(); document.querySelectorAll('#documents select').forEach((select, i) => { select.value = state[i]; }); }
window.addEventListener('pageshow', refreshState);
window.addEventListener('storage', event => { if (event.key === key || event.key === null) refreshState(); });
