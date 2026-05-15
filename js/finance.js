const FINANCE_API = "https://apibuy.okla.de5.net/api/orders";
let orders = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('finance');
  container.innerHTML = `
    <h2>财务管理</h2>

    <!-- 筛选栏 -->
    <div class="order-filters">
      <input id="filter_finance_customer" placeholder="客户名称">
      <input id="filter_finance_platform" placeholder="平台">
      <select id="filter_finance_status">
        <option value="">全部状态</option>
        <option value="待处理">待处理</option>
        <option value="部分发货">部分发货</option>
        <option value="已发货">已发货</option>
        <option value="已完成">已完成</option>
      </select>
      <input id="filter_finance_start" type="date">
      <input id="filter_finance_end" type="date">
      <button id="btn_search_finance" class="btn btn-primary">筛选</button>
      <button id="btn_reset_finance" class="btn btn-secondary">重置</button>
    </div>

    <!-- 财务 KPI -->
    <div class="dashboard-cards">
      <div class="card">订单数：<span id="finance_order_count">0</span></div>
      <div class="card">收入：¥<span id="finance_total_income">0</span></div>
      <div class="card">成本：¥<span id="finance_total_cost">0</span></div>
      <div class="card">利润：¥<span id="finance_total_profit">0</span></div>
    </div>

    <!-- 财务趋势图 -->
    <canvas id="finance_chart" width="400" height="200"></canvas>

    <!-- 订单明细 -->
    <div id="financeList" class="table"></div>
  `;

  // 搜索/重置事件
  document.getElementById('btn_search_finance').addEventListener('click', filterFinance);
  document.getElementById('btn_reset_finance').addEventListener('click', () => {
    document.getElementById('filter_finance_customer').value='';
    document.getElementById('filter_finance_platform').value='';
    document.getElementById('filter_finance_status').value='';
    document.getElementById('filter_finance_start').value='';
    document.getElementById('filter_finance_end').value='';
    loadFinance();
  });

  loadFinance();
});

// 加载订单数据
async function loadFinance() {
  const res = await fetch(FINANCE_API);
  orders = await res.json();
  renderFinance(orders);
}

// 渲染财务信息
function renderFinance(data) {
  const box = document.getElementById('financeList');
  box.innerHTML = '';

  let totalIncome = 0, totalCost = 0;
  data.forEach(o => {
    totalIncome += o.amount_cny || 0;
    totalCost += o.purchase_cost || 0;

    const div = document.createElement('div');
    div.className='order-row';
    div.innerHTML = `
      <div>系统单号: ${o.system_order_id}</div>
      <div>客户: ${o.customer}</div>
      <div>平台: ${o.platform}</div>
      <div>商品: ${o.product}</div>
      <div>金额: ¥${o.amount_cny}</div>
      <div>采购成本: ¥${o.purchase_cost}</div>
      <div>利润: ¥${(o.amount_cny||0)-(o.purchase_cost||0)}</div>
      <div>状态: ${o.status}</div>
    `;
    box.appendChild(div);
  });

  document.getElementById('finance_order_count').textContent = data.length;
  document.getElementById('finance_total_income').textContent = totalIncome.toFixed(2);
  document.getElementById('finance_total_cost').textContent = totalCost.toFixed(2);
  document.getElementById('finance_total_profit').textContent = (totalIncome-totalCost).toFixed(2);

  // 财务趋势图（按创建日期统计每天收入）
  const dailyIncome = {};
  data.forEach(o=>{
    const day = o.created_at.split(' ')[0];
    dailyIncome[day] = (dailyIncome[day]||0) + (o.amount_cny||0);
  });
  const labels = Object.keys(dailyIncome).sort();
  const dataset = labels.map(d=>dailyIncome[d]);

  const ctx = document.getElementById('finance_chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '每日收入',
        data: dataset,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive:true,
      plugins:{legend:{position:'bottom'}}
    }
  });
}

// 筛选功能
function filterFinance() {
  const customer = document.getElementById('filter_finance_customer').value.toLowerCase();
  const platform = document.getElementById('filter_finance_platform').value;
  const status = document.getElementById('filter_finance_status').value;
  const start = document.getElementById('filter_finance_start').value;
  const end = document.getElementById('filter_finance_end').value;

  const filtered = orders.filter(o=>{
    const orderDate = o.created_at.split(' ')[0];
    return (!customer || (o.customer||'').toLowerCase().includes(customer)) &&
           (!platform || o.platform === platform) &&
           (!status || o.status === status) &&
           (!start || orderDate >= start) &&
           (!end || orderDate <= end);
  });
  renderFinance(filtered);
}
