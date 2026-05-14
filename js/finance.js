const FINANCE_API = "https://apibuy.okla.de5.net/api/finance_records";
let finances = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('finance');
  container.innerHTML = `
    <h2>财务管理</h2>
    <div class="order-filters">
      <input id="filter_finance_name" placeholder="订单号/客户">
      <button id="btn_search_finance" class="btn btn-primary">搜索</button>
      <button id="btn_reset_finance" class="btn btn-secondary">重置</button>
    </div>
    <div id="financeList" class="table"></div>
  `;

  document.getElementById('btn_search_finance').addEventListener('click', filterFinance);
  document.getElementById('btn_reset_finance').addEventListener('click', () => {
    document.getElementById('filter_finance_name').value = '';
    loadFinance();
  });

  loadFinance();
});

async function loadFinance() {
  const res = await fetch(FINANCE_API);
  finances = await res.json();
  const box = document.getElementById('financeList');
  box.innerHTML = '';
  finances.forEach(f => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>订单号: ${f.order_id}</div>
      <div>客户: ${f.customer}</div>
      <div>收入: ¥${f.income}</div>
      <div>成本: ¥${f.cost}</div>
      <div>利润: ¥${f.profit}</div>
      <div>备注: ${f.note || '-'}</div>
    `;
    box.appendChild(div);
  });
}

function filterFinance() {
  const keyword = document.getElementById('filter_finance_name').value.toLowerCase();
  const box = document.getElementById('financeList');
  box.innerHTML = '';
  finances.filter(f => {
    return !keyword || String(f.order_id).includes(keyword) || f.customer.toLowerCase().includes(keyword);
  }).forEach(f => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>订单号: ${f.order_id}</div>
      <div>客户: ${f.customer}</div>
      <div>收入: ¥${f.income}</div>
      <div>成本: ¥${f.cost}</div>
      <div>利润: ¥${f.profit}</div>
      <div>备注: ${f.note || '-'}</div>
    `;
    box.appendChild(div);
  });
}
