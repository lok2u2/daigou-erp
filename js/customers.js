const CUSTOMER_API = "https://apibuy.okla.de5.net/api/customers";
let customers = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('customers');
  container.innerHTML = `
    <h2>客户管理</h2>

    <!-- 搜索栏 -->
    <div class="order-filters">
      <input id="filter_customer_name" placeholder="客户名称">
      <input id="filter_customer_contact" placeholder="联系方式">
      <input id="filter_customer_social" placeholder="社交联系方式">
      <button id="btn_search_customer" class="btn btn-primary">搜索</button>
      <button id="btn_reset_customer" class="btn btn-secondary">重置</button>
    </div>

    <!-- 新增客户行 -->
    <div class="add-row">
      <input id="new_name" placeholder="客户名称">
      <input id="new_contact" placeholder="联系方式">
      <input id="new_social" placeholder="社交联系方式">
      <input id="new_address" placeholder="地址">
      <input id="new_note" placeholder="备注">
      <button id="btn_add_customer" class="btn btn-primary">新增</button>
    </div>

    <div id="customerList" class="table"></div>
  `;

  // 搜索/重置
  document.getElementById('btn_search_customer').addEventListener('click', filterCustomers);
  document.getElementById('btn_reset_customer').addEventListener('click', () => {
    document.getElementById('filter_customer_name').value = '';
    document.getElementById('filter_customer_contact').value = '';
    document.getElementById('filter_customer_social').value = '';
    loadCustomers();
  });

  // 新增客户
  document.getElementById('btn_add_customer').addEventListener('click', async () => {
    const body = {
      name: document.getElementById('new_name').value,
      contact: document.getElementById('new_contact').value,
      social: document.getElementById('new_social').value,
      address: document.getElementById('new_address').value,
      note: document.getElementById('new_note').value
    };
    if(!body.name.trim()) { alert('客户名称必填'); return; }
    await fetch(`${CUSTOMER_API}/create`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    loadCustomers();
    document.getElementById('new_name').value='';
    document.getElementById('new_contact').value='';
    document.getElementById('new_social').value='';
    document.getElementById('new_address').value='';
    document.getElementById('new_note').value='';
  });

  loadCustomers();
});

// 加载客户列表
async function loadCustomers() {
  const res = await fetch(CUSTOMER_API);
  customers = await res.json();
  renderCustomerList(customers);
}

// 渲染客户表格
function renderCustomerList(data) {
  const box = document.getElementById('customerList');
  box.innerHTML = '';
  data.forEach(c => {
    const div = document.createElement('div');
    div.className='order-row';
    div.innerHTML = `
      <div>ID: ${c.id}</div>
      <div><input value="${c.name}" data-id="${c.id}" data-field="name"></div>
      <div><input value="${c.contact || ''}" data-id="${c.id}" data-field="contact"></div>
      <div><input value="${c.social || ''}" data-id="${c.id}" data-field="social"></div>
      <div><input value="${c.address || ''}" data-id="${c.id}" data-field="address"></div>
      <div><input value="${c.note || ''}" data-id="${c.id}" data-field="note"></div>
      <div>
        <button class="btn btn-primary" onclick="saveCustomer(${c.id})">保存</button>
        <button class="btn btn-danger" onclick="deleteCustomer(${c.id})">删除</button>
      </div>
    `;
    box.appendChild(div);
  });
}

// 保存行内修改
function saveCustomer(id) {
  const inputs = document.querySelectorAll(`#customerList input[data-id='${id}']`);
  const body = {};
  inputs.forEach(inp => {
    body[inp.dataset.field] = inp.value;
  });
  fetch(`${CUSTOMER_API}/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  }).then(()=> loadCustomers());
}

// 删除客户
function deleteCustomer(id) {
  if(!confirm('确定删除此客户吗？')) return;
  fetch(`${CUSTOMER_API}/${id}`, { method:'DELETE' }).then(()=> loadCustomers());
}

// 搜索过滤
function filterCustomers() {
  const name = document.getElementById('filter_customer_name').value.toLowerCase();
  const contact = document.getElementById('filter_customer_contact').value.toLowerCase();
  const social = document.getElementById('filter_customer_social').value.toLowerCase();

  const filtered = customers.filter(c => {
    return (!name || c.name.toLowerCase().includes(name)) &&
           (!contact || (c.contact||'').toLowerCase().includes(contact)) &&
           (!social || (c.social||'').toLowerCase().includes(social));
  });
  renderCustomerList(filtered);
}
