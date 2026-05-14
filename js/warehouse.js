const WAREHOUSE_API = "https://apibuy.okla.de5.net/api/warehouse_orders";
let packages = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('warehouse');
  container.innerHTML = `
    <h2>包裹管理</h2>
    <div class="order-filters">
      <input id="filter_package_order" placeholder="关联订单号">
      <input id="filter_package_tracking" placeholder="物流单号">
      <button id="btn_search_package" class="btn btn-primary">搜索</button>
      <button id="btn_reset_package" class="btn btn-secondary">重置</button>
    </div>
    <button id="openPackageBtn" class="btn btn-primary">+ 新增包裹</button>
    <div id="packageList" class="table"></div>
  `;

  document.getElementById('btn_search_package').addEventListener('click', filterPackages);
  document.getElementById('btn_reset_package').addEventListener('click', () => {
    document.getElementById('filter_package_order').value = '';
    document.getElementById('filter_package_tracking').value = '';
    loadPackages();
  });

  loadPackages();
});

// 加载包裹列表
async function loadPackages() {
  const res = await fetch(WAREHOUSE_API);
  packages = await res.json();
  const box = document.getElementById('packageList');
  box.innerHTML = '';
  packages.forEach(p => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>关联订单: ${p.order_id}</div>
      <div>物流单号: ${p.tracking_number}</div>
      <div>重量: ${p.weight || 0}</div>
      <div>运费: ¥${p.shipping_fee || 0}</div>
      <div>仓库状态: ${p.warehouse_status || '-'}</div>
      <div>
        <button class="btn btn-primary">编辑</button>
        <button class="btn btn-danger">删除</button>
      </div>
    `;
    box.appendChild(div);
  });
}

// 搜索过滤包裹
function filterPackages() {
  const order = document.getElementById('filter_package_order').value.toLowerCase();
  const tracking = document.getElementById('filter_package_tracking').value.toLowerCase();
  const box = document.getElementById('packageList');
  box.innerHTML = '';
  packages.filter(p => {
    return (!order || String(p.order_id).includes(order)) &&
           (!tracking || p.tracking_number.toLowerCase().includes(tracking));
  }).forEach(p => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>关联订单: ${p.order_id}</div>
      <div>物流单号: ${p.tracking_number}</div>
      <div>重量: ${p.weight || 0}</div>
      <div>运费: ¥${p.shipping_fee || 0}</div>
      <div>仓库状态: ${p.warehouse_status || '-'}</div>
      <div>
        <button class="btn btn-primary">编辑</button>
        <button class="btn btn-danger">删除</button>
      </div>
    `;
    box.appendChild(div);
  });
}
