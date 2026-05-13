const API = "https://apibuy.okla.de5.net";

let orders = [];
let customers = [];
let warehouse = [];

// ======================
// Tab切换
// ======================
function showTab(tab){
  document.querySelectorAll('.tab, .cards, .charts, .bottom-grid, .logs').forEach(el => el.style.display='none');
  
  if(tab === 'dashboard'){
    document.querySelector('.cards').style.display='grid';
    document.querySelector('.charts').style.display='grid';
    document.querySelector('.bottom-grid').style.display='grid';
    document.querySelector('.logs').style.display='block';
  }
}

// ======================
// 订单管理
// ======================
async function loadOrders(){
  const res = await fetch(`${API}/api/orders`);
  orders = await res.json();

  const orderBox = document.getElementById('orderList');
  if(!orderBox) return;
  orderBox.innerHTML = '';

  orders.forEach(o=>{
    const profit = (o.amount_cny||0) - (o.purchase_cost||0) - (o.shipping_cost||0);

    const div = document.createElement('div');
    div.className='order-row';
    div.innerHTML=`
      <div>${o.customer}</div>
      <div>${o.product}</div>
      <div>￥${o.amount_cny}</div>
      <div class="status ${getStatusClass(o.status)}">${o.status}</div>
      <div><button onclick="copyNotify(${o.id})">复制通知</button></div>
    `;
    orderBox.appendChild(div);
  });
}

function getStatusClass(status){
  switch(status){
    case '待处理': return 'orange';
    case '已到仓': return 'green';
    case '已发货': return 'blue';
    case '采购中': return 'purple';
    default: return 'cyan';
  }
}

// ======================
// 弹窗操作
// ======================
function openOrderModal(){
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal(){
  document.getElementById('modal').classList.add('hidden');
}

// ======================
// 保存订单
// ======================
async function saveOrder(){

  const body = {
    customer: document.getElementById("customer").value,
    product: document.getElementById("product").value,
    platform: document.getElementById("platform").value,
    amount_cny: Number(document.getElementById("amount").value),
    taobao_tracking: document.getElementById("taobao_tracking").value,
    purchase_cost: Number(document.getElementById("purchase_cost").value),
    shipping_cost: Number(document.getElementById("shipping_cost").value),
    note: document.getElementById("note").value,
    status: "待处理"
  };

  await fetch(`${API}/api/orders/create`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });

  closeModal();
  loadOrders();
}

// ======================
// 一键复制物流通知
// ======================
function copyNotify(id){
  const o = orders.find(x=>x.id===id);
  if(!o) return;
  const text = `
【代购发货通知】
客户：${o.customer}
商品：${o.product}
淘宝单号：${o.taobao_tracking}
金额：${o.amount_cny}
备注：${o.note || '-'}
`;
  navigator.clipboard.writeText(text);
  alert('已复制物流通知');
}

// ======================
// 客户管理
// ======================
async function loadCustomers(){
  const res = await fetch(`${API}/api/customers`);
  customers = await res.json();

  const customerBox = document.getElementById('customerList');
  if(!customerBox) return;
  customerBox.innerHTML='';
  customers.forEach(c=>{
    const div = document.createElement('div');
    div.className='order-row';
    div.innerHTML=`
      <div>${c.name}</div>
      <div>${c.contact}</div>
      <div>${c.address}</div>
    `;
    customerBox.appendChild(div);
  });
}

// ======================
// 仓库包裹管理
// ======================
async function loadWarehouse(){
  const res = await fetch(`${API}/api/warehouse`);
  warehouse = await res.json();

  const box = document.getElementById('warehouseList');
  if(!box) return;
  box.innerHTML='';
  warehouse.forEach(w=>{
    const div = document.createElement('div');
    div.className='order-row';
    div.innerHTML=`
      <div>${w.customer}</div>
      <div>${w.product}</div>
      <div>${w.tracking_number || '-'}</div>
      <div class="status ${getStatusClass(w.warehouse_status)}">${w.warehouse_status}</div>
    `;
    box.appendChild(div);
  });
}

// ======================
// 财务统计
// ======================
function loadFinance(){
  const financeBox = document.getElementById('financeBox');
  if(!financeBox) return;

  let totalRevenue = 0;
  let totalProfit = 0;
  orders.forEach(o=>{
    totalRevenue += o.amount_cny||0;
    totalProfit += ((o.amount_cny||0)-(o.purchase_cost||0)-(o.shipping_cost||0));
  });

  financeBox.innerHTML = `
    <h3>营业额：￥${totalRevenue}</h3>
    <h3>利润：￥${totalProfit}</h3>
    <p>订单总数：${orders.length}</p>
  `;
}

// ======================
// 初始化加载
// ======================
async function initDashboard(){
  showTab('dashboard');
  await loadOrders();
  await loadCustomers();
  await loadWarehouse();
  loadFinance();
}

// ======================
// 初始化执行
// ======================
initDashboard();
