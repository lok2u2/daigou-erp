document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('system');
  container.innerHTML = `
    <h2>系统管理</h2>
    <p>这里可以添加系统配置、管理员权限管理、日志管理等功能。</p>
    <div class="order-filters">
      <button class="btn btn-primary">刷新系统状态</button>
      <button class="btn btn-secondary">新增管理员</button>
    </div>
    <div id="systemList" class="table"></div>
  `;

  // 示例：刷新系统状态
  container.querySelector('.btn-primary').addEventListener('click', () => {
    alert('系统状态刷新（可对接 Worker API 获取实时状态）');
  });

  container.querySelector('.btn-secondary').addEventListener('click', () => {
    alert('新增管理员弹窗（可扩展）');
  });
});
