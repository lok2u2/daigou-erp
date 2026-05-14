const CUSTOMER_API = "https://apibuy.okla.de5.net/api/customers";
let customers = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('customers');
  container.innerHTML = `
    <h2>客户管理</h2>
    <div class="order-filters">
      <input id="filter_customer_name" placeholder="客户名称">
      <input id="filter_customer_contact" placeholder="联系方式">
      <button id="btn_search_customer" class="btn btn-primary">搜索</button>
      <button id="btn_reset_customer" class="btn btn-secondary">重置</button>
    </div>
    <button id="openCustomerBtn" class="btn btn-primary">+ 新增客户</button>
    <div id="customerList" class="table"></div>
  `;

  document.getElementById('btn_search_customer').addEventListener('click', filterCustomers);
  document.getElementById('btn_reset_customer').addEventListener('click', () => {
    document.getElementById('filter_customer_name').value = '';
    document.getElementById('filter_customer_contact').value = '';
    loadCustomers();
  });

  loadCustomers();
});

async function loadCustomers() {
  const res = await fetch(CUSTOMER_API);
  customers = await res.json();
  const box = document.getElementById('customerList');
  box.innerHTML = '';
  customers.forEach(c => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>客户名称: ${c.name}</div>
      <div>联系方式: ${c.contact}</div>
      <div>地址: ${c.address || '-'}</div>
      <div>备注: ${c.note || '-'}</div>
      <div>
        <button class="btn btn-primary">编辑</button>
        <button class="btn btn-danger">删除</button>
      </div>
    `;
    box.appendChild(div);
  });
}

function filterCustomers() {
  const name = document.getElementById('filter_customer_name').value.toLowerCase();
  const contact = document.getElementById('filter_customer_contact').value.toLowerCase();
  const box = document.getElementById('customerList');
  box.innerHTML = '';
  customers.filter(c => {
    return (!name || c.name.toLowerCase().includes(name)) &&
           (!contact || c.contact.toLowerCase().includes(contact));
  }).forEach(c => {
    const div = document.createElement('div');
    div.className = 'order-row';
    div.innerHTML = `
      <div>客户名称: ${c.name}</div>
      <div>联系方式: ${c.contact}</div>
      <div>地址: ${c.address || '-'}</div>
      <div>备注: ${c.note || '-'}</div>
      <div>
        <button class="btn btn-primary">编辑</button>
        <button class="btn btn-danger">删除</button>
      </div>
    `;
    box.appendChild(div);
  });
}
