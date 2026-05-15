const ORDERS_API = "https://apibuy.okla.de5.net/api/orders"; // 替换成你的 Worker API 地址

async function loadOrders() {
  const box = document.getElementById('orders');
  box.innerHTML = '<h2>订单管理</h2>';

  try {
    const res = await fetch(ORDERS_API);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      box.innerHTML += '<p>暂无订单数据</p>';
      return;
    }

    // 创建表格
    const table = document.createElement('table');
    table.className = 'order-table';
    table.innerHTML = `
      <tr>
        <th>订单号</th>
        <th>客户</th>
        <th>商品</th>
        <th>平台</th>
        <th>数量</th>
        <th>金额(CNY)</th>
        <th>状态</th>
      </tr>
    `;

    data.forEach(o => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${o.system_order_id || '-'}</td>
        <td>${o.customer || '-'}</td>
        <td>${o.product || '-'}</td>
        <td>${o.platform || '-'}</td>
        <td>${o.quantity || 0}</td>
        <td>${o.amount_cny || 0}</td>
        <td>${o.status || '-'}</td>
      `;
      table.appendChild(row);
    });

    box.appendChild(table);

  } catch (err) {
    console.error('加载订单失败:', err);
    box.innerHTML += `<p style="color:red;">加载订单失败：${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadOrders);
