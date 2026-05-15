const SYSTEM_API = "https://apibuy.okla.de5.net/api/employees";
const LOG_API = "https://apibuy.okla.de5.net/api/logs";
let users = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('system');
  container.innerHTML = `
    <h2>系统管理</h2>

    <!-- 用户管理搜索栏 -->
    <div class="order-filters">
      <input id="filter_user_name" placeholder="用户名">
      <select id="filter_user_role">
        <option value="">全部角色</option>
        <option value="admin">管理员</option>
        <option value="finance">财务</option>
        <option value="warehouse">仓库</option>
        <option value="staff">普通员工</option>
      </select>
      <button id="btn_search_user" class="btn btn-primary">搜索</button>
      <button id="btn_reset_user" class="btn btn-secondary">重置</button>
    </div>

    <!-- 新增用户行 -->
    <div class="add-row">
      <input id="new_username" placeholder="用户名">
      <input id="new_real_name" placeholder="真实姓名">
      <input id="new_password" placeholder="密码">
      <select id="new_role">
        <option value="admin">管理员</option>
        <option value="finance">财务</option>
        <option value="warehouse">仓库</option>
        <option value="staff" selected>普通员工</option>
      </select>
      <button id="btn_add_user" class="btn btn-primary">新增</button>
    </div>

    <!-- 用户列表 -->
    <div id="userList" class="table"></div>

    <!-- 系统配置占位 -->
    <h3>系统配置（占位）</h3>
    <div style="padding:10px;background:#0d1b34;border-radius:12px;">暂无配置项</div>

    <!-- 日志占位 -->
    <h3>操作日志（占位）</h3>
    <div style="padding:10px;background:#0d1b34;border-radius:12px;">暂无日志内容</div>
  `;

  // 搜索/重置事件
  document.getElementById('btn_search_user').addEventListener('click', filterUsers);
  document.getElementById('btn_reset_user').addEventListener('click', () => {
    document.getElementById('filter_user_name').value='';
    document.getElementById('filter_user_role').value='';
    loadUsers();
  });

  // 新增用户
  document.getElementById('btn_add_user').addEventListener('click', async () => {
    const body = {
      username: document.getElementById('new_username').value,
      real_name: document.getElementById('new_real_name').value,
      password: document.getElementById('new_password').value,
      role: document.getElementById('new_role').value
    };
    if(!body.username || !body.real_name || !body.password){
      alert('用户名、真实姓名和密码必填'); return;
    }
    await fetch(`${SYSTEM_API}/create`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    loadUsers();
    // 清空表单
    document.getElementById('new_username').value='';
    document.getElementById('new_real_name').value='';
    document.getElementById('new_password').value='';
  });

  loadUsers();
});

// 加载用户列表
async function loadUsers(){
  const res = await fetch(SYSTEM_API);
  users = await res.json();
  renderUserList(users);
}

// 渲染用户表格
function renderUserList(data){
  const box = document.getElementById('userList');
  box.innerHTML='';
  data.forEach(u=>{
    const div = document.createElement('div');
    div.className='order-row';
    div.innerHTML=`
      <div>ID: ${u.id}</div>
      <div>用户名: <input value="${u.username}" data-id="${u.id}" data-field="username"></div>
      <div>真实姓名: <input value="${u.real_name}" data-id="${u.id}" data-field="real_name"></div>
      <div>角色: 
        <select data-id="${u.id}" data-field="role">
          <option value="admin" ${u.role==='admin'?'selected':''}>管理员</option>
          <option value="finance" ${u.role==='finance'?'selected':''}>财务</option>
          <option value="warehouse" ${u.role==='warehouse'?'selected':''}>仓库</option>
          <option value="staff" ${u.role==='staff'?'selected':''}>普通员工</option>
        </select>
      </div>
      <div>创建时间: ${u.created_at}</div>
      <div>
        <button class="btn btn-primary" onclick="saveUser(${u.id})">保存</button>
        <button class="btn btn-danger" onclick="deleteUser(${u.id})">删除</button>
      </div>
    `;
    box.appendChild(div);
  });
}

// 保存用户修改
function saveUser(id){
  const inputs = document.querySelectorAll(`#userList [data-id='${id}']`);
  const body = {};
  inputs.forEach(inp=>{
    if(inp.tagName==='INPUT'){
      body[inp.dataset.field]=inp.value;
    } else if(inp.tagName==='SELECT'){
      body[inp.dataset.field]=inp.value;
    }
  });
  fetch(`${SYSTEM_API}/${id}`,{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  }).then(()=> loadUsers());
}

// 删除用户
function deleteUser(id){
  if(!confirm('确定删除该用户吗？')) return;
  fetch(`${SYSTEM_API}/${id}`,{method:'DELETE'}).then(()=> loadUsers());
}

// 搜索过滤
function filterUsers(){
  const name = document.getElementById('filter_user_name').value.toLowerCase();
  const role = document.getElementById('filter_user_role').value;

  const filtered = users.filter(u=>{
    return (!name || u.username.toLowerCase().includes(name)) &&
           (!role || u.role === role);
  });
  renderUserList(filtered);
}
