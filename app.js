const state = {
  available: 42,
  dailyBudget: 65,
  spent: 23
};

const dateElement = document.querySelector('#today-date');
const now = new Date();
dateElement.textContent = now.toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long'
}).toUpperCase();

const navItems = document.querySelectorAll('.nav-item[data-view]');
const views = {
  today: document.querySelector('#today-view'),
  bills: document.querySelector('#bills-view'),
  plan: document.querySelector('#plan-view'),
  insights: document.querySelector('#insights-view')
};
const titles = {
  today: 'Good morning, Alex',
  bills: 'Bills',
  plan: 'Your plan',
  insights: 'Insights'
};

function switchView(viewName) {
  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
  Object.entries(views).forEach(([name, view]) => view.classList.toggle('active', name === viewName));
  document.querySelector('#view-title').textContent = titles[viewName];
}

navItems.forEach(item => item.addEventListener('click', () => switchView(item.dataset.view)));
document.querySelector('#view-bills').addEventListener('click', () => switchView('bills'));

const dialog = document.querySelector('#transaction-dialog');
document.querySelector('#add-transaction').addEventListener('click', () => dialog.showModal());

document.querySelector('#transaction-form').addEventListener('submit', event => {
  event.preventDefault();

  const name = document.querySelector('#transaction-name').value.trim();
  const rawAmount = document.querySelector('#transaction-value').value;
  const type = document.querySelector('#transaction-type').value;
  const amount = Number(rawAmount);

  if (!name || !amount) return;

  const positive = type === 'income';
  const article = document.createElement('article');
  article.className = 'transaction';
  article.innerHTML = `
    <span class="category-icon ${positive ? 'income' : 'food'}">
      <svg viewBox="0 0 24 24"><path d="${positive ? 'M12 20V4M5 11l7-7 7 7' : 'M7 3v8M10 3v8M7 7h3M8.5 11v10M16 3v18M16 3c3 3 3 7 0 9'}"/></svg>
    </span>
    <div class="transaction-info"><strong>${escapeHtml(name)}</strong><small>${positive ? 'Income' : 'Expense'} · Just now</small></div>
    <strong class="transaction-amount ${positive ? 'positive' : ''}">${positive ? '+' : '−'}£${amount.toFixed(2)}</strong>
  `;

  document.querySelector('#transaction-list').prepend(article);

  if (positive) {
    state.available += amount;
  } else {
    state.available -= amount;
    state.spent += amount;
  }
  updateBudget();

  event.target.reset();
  dialog.close();
});

function escapeHtml(value) {
  const span = document.createElement('span');
  span.textContent = value;
  return span.innerHTML;
}

function updateBudget() {
  document.querySelector('#safe-number').textContent = `£${state.available.toFixed(2)}`;
  document.querySelector('#daily-budget').textContent = `£${state.dailyBudget.toFixed(2)}`;
  document.querySelector('#already-spent').textContent = `£${state.spent.toFixed(2)}`;

  const paceText = document.querySelector('#pace-text');
  paceText.textContent = state.available >= 20
    ? "You're pacing well"
    : state.available >= 0
      ? 'Take care of the remaining balance'
      : 'This needs attention';
}
