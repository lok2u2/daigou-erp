const API = "https://apibuy.okla.de5.net";
let orders = [];

// 确保 DOM 完全加载
document.addEventListener('DOMContentLoaded', ()=>{

  // 左侧菜单切换
  document.querySelectorAll('.menu button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const tab = btn.dataset.tab;
      document.querySelectorAll('.module').forEach(m=>m.classList.add('hidden'));
      document.getElementById(tab).classList.remove('hidden');
    });
  });

  // 弹窗控制
  const modal = document.getElementById('modal');
  const openBtn = document.getElementById('openOrderBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const saveBtn = document.getElementById('saveOrderBtn');

  // 初始隐藏弹窗
  modal.classList.add('hidden');

  // 打开弹窗
  openBtn.addEventListener('click', ()=> modal.classList.remove('hidden'));

  // 关闭弹窗
  closeBtn.addEventListener('click', ()=> modal.classList.add('hidden'));

  // 保存订单
  saveBtn.addEventListener('click', async ()=>{
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
      body: JSON.stringify(body)
    });
    modal.classList.add('hidden'); // 保存后关闭
    loadOrders();
  });

  // 默认显示首页
  document.querySelector('[data-tab="dashboard"]').click();

  // 加载订单
  loadOrders();
});

// 加载订单列表
async function loadOrders(){
  const res = await fetch(`${API}/api/orders`);
  orders = await res.json();
  const box = document.getElementById('orderList');
  if(!box) return;
  box.innerHTML='';
  orders.forEach(o=>{
    const profit = (o.amount_cny||0) - (o.purchase_cost||0) - (o.shipping_cost||0);
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `<div>${o.customer}</div><div>${o.product}</div><div>￥${o.amount_cny}</div><div>利润:￥${profit}</div><div>${o.taobao_tracking||'-'}</div>
      <div><button onclick="copyNotify(${o.id})">复制通知</button></div>`;
    box.appendChild(div);
  });
}

// 一键复制物流通知
function copyNotify(id){
  const o = orders.find(x=>x.id===id);
  if(!o) return;
  const text = `【代购发货通知】
客户：${o.customer}
商品：${o.product}
淘宝单号：${o.taobao_tracking}
金额：${o.amount_cny}
备注：${o.note||'-'}`;
  navigator.clipboard.writeText(text);
  alert('已复制物流通知');
}
