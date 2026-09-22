'use strict';
const statuses = ['Не розпочато', 'В роботі', 'Готово', 'Потребує оновлення'];
const docs = ['Регистрационные сведения', 'Налоговая отчётность', 'Основание использования помещения', 'Коммерческие предложения на оборудование', 'Подтверждения закупок', 'Договоры с поставщиками'];
const key = 'budap-demo-documents-v1';
let state = docs.map(() => statuses[0]);
try { const saved = JSON.parse(localStorage.getItem(key)); if (Array.isArray(saved) && saved.length === docs.length) state = saved.map(v => statuses.includes(v) ? v : statuses[0]); }
catch { document.querySelector('#storage-message').textContent = 'Сохранение недоступно. Отметки действуют до перезагрузки.'; }
function progress() { const n = state.filter(v => v === 'Готово').length; document.querySelector('#readiness').textContent = `${Math.round(n / docs.length * 100)}%`; document.querySelector('#ready-count').textContent = `${n} из ${docs.length} готово`; document.querySelector('#progress').value = n; }
docs.forEach((name, i) => {
 const row = document.createElement('div'); row.className = 'doc';
 const label = document.createElement('label'); label.htmlFor = `doc-${i}`; label.textContent = name;
 const select = document.createElement('select'); select.id = label.htmlFor; statuses.forEach(s => select.add(new Option(s,s))); select.value = state[i];
 select.addEventListener('change', () => { state[i] = select.value; progress(); try { localStorage.setItem(key, JSON.stringify(state)); document.querySelector('#storage-message').textContent = 'Демонстрационные отметки сохранены в этом браузере.'; } catch { document.querySelector('#storage-message').textContent = 'Сохранение недоступно. Отметки исчезнут после перезагрузки.'; } });
 row.append(label, select); document.querySelector('#documents').append(row);
});
progress();
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let programs = [];
function render(filter = 'all') {
 document.querySelector('#programs').innerHTML = programs.filter(p => filter === 'all' || p.type === filter).map(p => {
 const e = Object.fromEntries(Object.entries(p).map(([k,v]) => [k,esc(v)]));
 return `<article class="card"><div class="program-head"><div><span class="pill">${e.tag}</span><h3>${e.name}</h3></div><strong class="amount">${e.amount}</strong></div><div class="two"><div><h4>Официальные условия</h4><p>${e.terms}</p><h4>Расходы</h4><p>${e.spending}</p></div><div><h4>Предварительная оценка</h4><p class="assessment">${e.assessment}</p><h4>Что уточнить</h4><p>${e.unknown}</p></div></div><details><summary>Банки и сроки</summary><p>${e.banks}</p><p>${e.deadline}</p></details><div class="source"><a href="${e.source}">${e.sourceName} ↗</a><span>Проверка: ${e.checked}</span></div></article>`;
 }).join('');
}
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === b))); render(b.dataset.filter); }));
fetch('data/programs.json').then(r => { if (!r.ok) throw Error('Load failed'); return r.json(); }).then(data => { programs = data; render(document.querySelector('[data-filter][aria-pressed="true"]').dataset.filter); }).catch(() => { document.querySelector('#programs').textContent = 'Не удалось загрузить программы. Обновите страницу или повторите позже.'; });
