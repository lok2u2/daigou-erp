const API = "https://apibuy.okla.de5.net";
let orders = [];

document.addEventListener('DOMContentLoaded', () => {
  const ordersContainer = document.getElementById('orders');

  // 新增订单弹窗 HTML
  ordersContainer.insertAdjacentHTML('beforeend', `
    <div id="modal" class="modal hidden">
      <div class="modal-box">
        <h3 id="modalTitle">新增订单</h3>
        <input id="customer" placeholder="客户名称">
        <input id="product" placeholder="商品名称">
        <input id="platform" placeholder="平台">
        <input id="amount" placeholder="订单金额">
        <input id="taobao_tracking" placeholder="物流单号（可空）">
        <input id="purchase_cost" placeholder="采购成本">
        <input id="note" placeholder="备注">
        <div class="modal-actions">
          <button id="saveOrderBtn" class="btn btn-primary">保存订单</button>
          <button id="closeModalBtn" class="btn btn-danger">关闭</button>
        </div>
      </div>
    </div>
  `);

  // 获取 DOM 元素
  const modal = document.getElementById('modal');
  const openBtn = document.getElementById('openOrderBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const saveBtn = document.getElementById('saveOrderBtn');

  // 弹窗控制
  modal.classList.add('hidden');
  openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  // 保存订单
  saveBtn.addEventListener('click', async () => {
    const body = {
      customer: document.getElementById("customer").value,
      product: document.getElementById("product").value,
      platform: document.getElementById("platform").value,
      amount_cny: Number(document.getElementById("amount").value),
      taobao_tracking: document.getElementById("taobao_tracking").value,
      purchase_cost: Number(document.getElementById("purchase_cost").value),
      note: document.getElementById("note").value
    };
    await fetch(`${API}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    modal.classList.add('hidden');
    loadOrders();
  });

  // 搜索和重置
  document.getElementById('btn_search').addEventListener('click', filterOrders);
  document.getElementById('btn_reset').addEventListener('click', () => {
    document.getElementById('filter_order_id').value = '';
    document.getElementById('filter_customer').value = '';
    document.getElementById('filter_platform').value = '';
    document.getElementById('filter_status').value = '';
    document.getElementById('filter_date').value = '';
    loadOrders();
  });

  loadOrders();
});

// 加载订单列表
async function loadOrders() {
  const res = await fetch(`${API}/api/orders`);
  orders = await res.json();
  const box = document.getElementById('orderList');
  box.innerHTML = '';

  orders.forEach(o => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>系统单号: ${o.system_order_id}</div>
      <div>客户: ${o.customer}</div>
      <div>平台: ${o.platform}</div>
      <div>金额: ¥${o.amount_cny}</div>
      <div>利润: ¥${(o.amount_cny || 0) - (o.purchase_cost || 0)}</div>
      <div>状态: ${o.status}</div>
      <div>
        <button onclick="togglePackages(${o.id})">+ 查看/添加物流单号</button>
        <button onclick="copyNotify(${o.id})">复制通知</button>
      </div>
      <div class="package-list hidden" id="packages-${o.id}"></div>
    `;
    box.appendChild(div);
    loadPackages(o.id);
  });
}

// 加载每个订单的物流包裹
async function loadPackages(orderId) {
  const res = await fetch(`${API}/api/orders/${orderId}/packages`);
  const packages = await res.json();
  const list = document.getElementById(`packages-${orderId}`);
  list.innerHTML = '';

  packages.forEach(p => {
    const div = document.createElement('div');
    div.textContent = `${p.tracking_number} - 状态: ${p.status}`;
    list.appendChild(div);
  });

  // 添加物流单号按钮
  const addBtn = document.createElement('button');
  addBtn.textContent = '+ 添加物流单号';
  addBtn.className = 'btn btn-primary';
  addBtn.onclick = () => addPackage(orderId);
  list.appendChild(addBtn);
}

// 折叠/展开物流包裹
function togglePackages(orderId) {
  const list = document.getElementById(`packages-${orderId}`);
  list.classList.toggle('hidden');
}

// 新增物流单号
function addPackage(orderId) {
  const trackingNumber = prompt("请输入新的物流单号");
  if (!trackingNumber) return;
  fetch(`${API}/api/orders/${orderId}/package`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tracking_number: trackingNumber })
  }).then(() => loadPackages(orderId));
}

// 复制物流通知
function copyNotify(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  const text = `【代购发货通知】
客户：${o.customer}
商品：${o.product}
物流单号：${o.taobao_tracking}
金额：${o.amount_cny}
备注：${o.note || '-'}`;
  navigator.clipboard.writeText(text);
  alert('已复制物流通知');
}

// 搜索过滤订单
function filterOrders() {
  const orderId = document.getElementById('filter_order_id').value.toLowerCase();
  const customer = document.getElementById('filter_customer').value.toLowerCase();
  const platform = document.getElementById('filter_platform').value;
  const status = document.getElementById('filter_status').value;
  const date = document.getElementById('filter_date').value;
  const box = document.getElementById('orderList');
  box.innerHTML = '';

  orders.filter(o => {
    return (!orderId || o.system_order_id.toLowerCase().includes(orderId)) &&
           (!customer || o.customer.toLowerCase().includes(customer)) &&
           (!platform || o.platform === platform) &&
           (!status || o.status === status) &&
           (!date || o.created_at.startsWith(date));
  }).forEach(o => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>系统单号: ${o.system_order_id}</div>
      <div>客户: ${o.customer}</div>
      <div>平台: ${o.platform}</div>
      <div>金额: ¥${o.amount_cny}</div>
      <div>利润: ¥${(o.amount_cny || 0) - (o.purchase_cost || 0)}</div>
      <div>状态: ${o.status}</div>
      <div>
        <button onclick="togglePackages(${o.id})">+ 查看/添加物流单号</button>
        <button onclick="copyNotify(${o.id})">复制通知</button>
      </div>
      <div class="package-list hidden" id="packages-${o.id}"></div>
    `;
    box.appendChild(div);
    loadPackages(o.id);
  });
}
