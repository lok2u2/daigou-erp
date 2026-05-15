const ORDERS_API = "https://apibuy.okla.de5.net/api/orders"; // 使用你自己的 Worker API 地址

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

    // 创建表格头
    const table = document.createElement('div');
    table.className = 'table';
    table.innerHTML = `
      <div class="order-row">
        <strong>订单号</strong>
        <strong>客户</strong>
        <strong>商品</strong>
        <strong>平台</strong>
        <strong>数量</strong>
        <strong>金额(CNY)</strong>
        <strong>状态</strong>
      </div>
    `;

    // 渲染每条订单
    data.forEach(o => {
      const row = document.createElement('div');
      row.className = 'order-row';
      row.innerHTML = `
        <div>${o.system_order_id || '-'}</div>
        <div>${o.customer || '-'}</div>
        <div>${o.product || '-'}</div>
        <div>${o.platform || '-'}</div>
        <div>${o.quantity || 0}</div>
        <div>${o.amount_cny || 0}</div>
        <div>${o.status || '-'}</div>
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
