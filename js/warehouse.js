const WAREHOUSE_API = "https://apibuy.okla.de5.net/api/warehouse_orders";
let packages = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('warehouse');
  container.innerHTML = `
    <h2>包裹管理</h2>

    <!-- 搜索栏 -->
    <div class="order-filters">
      <input id="filter_package_order" placeholder="关联订单ID">
      <input id="filter_package_customer" placeholder="客户名称">
      <input id="filter_package_tracking" placeholder="物流单号">
      <input id="filter_package_status" placeholder="仓库状态">
      <button id="btn_search_package" class="btn btn-primary">搜索</button>
      <button id="btn_reset_package" class="btn btn-secondary">重置</button>
    </div>

    <!-- 新增包裹行 -->
    <div class="add-row">
      <input id="new_order_id" placeholder="关联订单ID">
      <input id="new_customer" placeholder="客户名称">
      <input id="new_product" placeholder="商品名称">
      <input id="new_tracking" placeholder="物流单号">
      <input id="new_status" placeholder="仓库状态">
      <input id="new_shelf" placeholder="货架编号">
      <input id="new_weight" placeholder="重量">
      <input id="new_fee" placeholder="运费">
      <input id="new_note" placeholder="备注">
      <button id="btn_add_package" class="btn btn-primary">新增</button>
    </div>

    <div id="packageList" class="table"></div>
  `;

  // 搜索/重置
  document.getElementById('btn_search_package').addEventListener('click', filterPackages);
  document.getElementById('btn_reset_package').addEventListener('click', () => {
    document.getElementById('filter_package_order').value='';
    document.getElementById('filter_package_customer').value='';
    document.getElementById('filter_package_tracking').value='';
    document.getElementById('filter_package_status').value='';
    loadPackages();
  });

  // 新增包裹
  document.getElementById('btn_add_package').addEventListener('click', async () => {
    const body = {
      order_id: document.getElementById('new_order_id').value,
      customer: document.getElementById('new_customer').value,
      product: document.getElementById('new_product').value,
      tracking_number: document.getElementById('new_tracking').value,
      warehouse_status: document.getElementById('new_status').value,
      shelf_code: document.getElementById('new_shelf').value,
      weight: Number(document.getElementById('new_weight').value) || 0,
      shipping_fee: Number(document.getElementById('new_fee').value) || 0,
      warehouse_note: document.getElementById('new_note').value
    };
    if(!body.order_id || !body.customer || !body.product){
      alert('订单ID、客户和商品必填'); return;
    }
    await fetch(`${WAREHOUSE_API}/create`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    loadPackages();
    // 清空表单
    ['new_order_id','new_customer','new_product','new_tracking','new_status','new_shelf','new_weight','new_fee','new_note'].forEach(id=>document.getElementById(id).value='');
  });

  loadPackages();
});

// 加载包裹列表
async function loadPackages() {
  const res = await fetch(WAREHOUSE_API);
  packages = await res.json();
  renderPackageList(packages);
}

// 渲染包裹列表
function renderPackageList(data) {
  const box = document.getElementById('packageList');
  box.innerHTML = '';
  data.forEach(p => {
    const div = document.createElement('div');
    div.className='order-row';
    div.innerHTML = `
      <div>ID: ${p.id}</div>
      <div>订单ID: <input value="${p.order_id}" data-id="${p.id}" data-field="order_id"></div>
      <div>客户: <input value="${p.customer}" data-id="${p.id}" data-field="customer"></div>
      <div>商品: <input value="${p.product}" data-id="${p.id}" data-field="product"></div>
      <div>
        物流单号: <input value="${p.tracking_number}" data-id="${p.id}" data-field="tracking_number">
        <button class="btn btn-primary" onclick="togglePackageList(${p.id})">折叠/展开</button>
      </div>
      <div class="package-sublist hidden" id="package_sublist_${p.id}"></div>
      <div>仓库状态: <input value="${p.warehouse_status || ''}" data-id="${p.id}" data-field="warehouse_status"></div>
      <div>货架: <input value="${p.shelf_code || ''}" data-id="${p.id}" data-field="shelf_code"></div>
      <div>重量: <input value="${p.weight || 0}" data-id="${p.id}" data-field="weight"></div>
      <div>运费: <input value="${p.shipping_fee || 0}" data-id="${p.id}" data-field="shipping_fee"></div>
      <div>备注: <input value="${p.warehouse_note || ''}" data-id="${p.id}" data-field="warehouse_note"></div>
      <div>
        <button class="btn btn-primary" onclick="savePackage(${p.id})">保存</button>
        <button class="btn btn-danger" onclick="deletePackage(${p.id})">删除</button>
      </div>
    `;
    box.appendChild(div);
  });
}

// 保存行内修改
function savePackage(id){
  const inputs = document.querySelectorAll(`#packageList input[data-id='${id}']`);
  const body = {};
  inputs.forEach(inp => body[inp.dataset.field]=inp.value);
  fetch(`${WAREHOUSE_API}/${id}`,{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  }).then(()=> loadPackages());
}

// 删除包裹
function deletePackage(id){
  if(!confirm('确定删除此包裹吗？')) return;
  fetch(`${WAREHOUSE_API}/${id}`,{method:'DELETE'}).then(()=> loadPackages());
}

// 搜索过滤
function filterPackages(){
  const order = document.getElementById('filter_package_order').value.toLowerCase();
  const customer = document.getElementById('filter_package_customer').value.toLowerCase();
  const tracking = document.getElementById('filter_package_tracking').value.toLowerCase();
  const status = document.getElementById('filter_package_status').value.toLowerCase();

  const filtered = packages.filter(p=>{
    return (!order || String(p.order_id).toLowerCase().includes(order)) &&
           (!customer || (p.customer||'').toLowerCase().includes(customer)) &&
           (!tracking || (p.tracking_number||'').toLowerCase().includes(tracking)) &&
           (!status || (p.warehouse_status||'').toLowerCase().includes(status));
  });
  renderPackageList(filtered);
}

// 多物流单号折叠/展开
function togglePackageList(id){
  const sublist = document.getElementById(`package_sublist_${id}`);
  sublist.classList.toggle('hidden');
}
