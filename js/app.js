// 全局 JS - 管理菜单切换和全局逻辑
document.addEventListener('DOMContentLoaded', () => {
  // 获取左侧菜单所有按钮
  const menuButtons = document.querySelectorAll('.menu button');

  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // 隐藏所有模块
      document.querySelectorAll('.module').forEach(m => {
        m.classList.add('hidden');
      });

      // 显示当前模块
      const currentModule = document.getElementById(tab);
      if (currentModule) currentModule.classList.remove('hidden');

      // 高亮当前按钮
      menuButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // 可选：全局弹窗管理或全局提示函数
  window.showAlert = function(message) {
    alert(message);
  };

  // 初始化：显示默认模块（首页）
  const defaultTab = document.querySelector('.menu button.active')?.dataset.tab || 'dashboard';
  document.getElementById(defaultTab)?.classList.remove('hidden');
});
