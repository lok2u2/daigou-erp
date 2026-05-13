// =========================
// app.js V12 完整版
// =========================
const API = "https://apibuy.okla.de5.net";

const TOKEN = localStorage.getItem("erp_token");
const USER = JSON.parse(localStorage.getItem("erp_user") || "{}");

// 登录检测
if (!TOKEN) location.href = "login.html";

// ---------------------
// API 请求封装
// ---------------------
async function api(url, options = {}) {
  options.headers = {
    ...(options.headers || {}),
    Authorization: "Bearer " + TOKEN,
    "Content-Type": "application/json"
  };
  const res = await fetch(API + url, options);
  if (res.status === 401) logout();
  return res.json();
}

// ---------------------
// 页面切换
// ---------------------
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// ---------------------
// 权限控制菜单
// ---------------------
function applyRolePermissions() {
  const menuButtons = document.querySelectorAll(".sidebar .menu button");
  menuButtons.forEach(btn => {
    const pageId = btn.getAttribute("onclick").match(/'(\w+)'/)[1];
    btn.style.display = "none";
    if (USER.role === "admin") btn.style.display = "block";
    else if (USER.role === "finance" && pageId === "finance") btn.style.display = "block";
    else if (USER.role === "warehouse" && pageId === "packages") btn.style.display = "block";
    else if (USER.role === "staff" && (pageId === "orders" || pageId === "customers")) btn.style.display = "block";
  });
  const firstVisible = document.querySelector(".sidebar .menu button[style*='block']");
  if (firstVisible) {
    const pageId = firstVisible.getAttribute("onclick").match(/'(\w+)'/)[1];
    showPage(pageId);
  }
}
window.addEventListener("DOMContentLoaded", applyRolePermissions);

// ---------------------
// 退出登录
// ---------------------
function logout() {
  localStorage.removeItem("erp_token");
  localStorage.removeItem("erp_user");
  localStorage.removeItem("erp_login");
  location.href = "login.html";
}

// ---------------------
// 数据存储
// ---------------------
let ALL_ORDERS = [], ALL_CUSTOMERS = [], ALL_PACKAGES = [];

// ---------------------
// 订单管理
// ---------------------
async function loadOrders() {
  const res = await api("/api/orders");
  if (!res) return;
  ALL_ORDERS = res;
  renderOrders(res);
  updateFinance(res);
}

function renderOrders(orders) {
  const box = document.getElementById("ordersList");
  const archive = document.getElementById("archiveOrders");
  box.innerHTML = "";
  archive.innerHTML = "";
  orders.forEach(order => {
    let buttons = `<button onclick="changeStatus(${order.id})">状态</button>`;
    if (USER.role === "admin") {
      buttons += `<button onclick="editOrder(${order.id})">编辑</button>
                  <button onclick="deleteOrder(${order.id})">删除</button>`;
    }
    const html = `
      <div class="order-card">
        <h3>${order.customer || ""}</h3>
        <p>商品：${order.product || ""}</p>
        <p>平台：${order.platform || ""}</p>
        <p>金额：¥ ${order.amount_cny || 0}</p>
        <p>状态：${order.status || ""}</p>
        <div class="order-buttons">${buttons}</div>
      </div>
    `;
    if (order.status === "已完成") archive.innerHTML += html;
    else box.innerHTML += html;
  });
}

function searchOrders(keyword) {
  keyword = keyword.toLowerCase();
  const result = ALL_ORDERS.filter(o =>
    (o.customer || "").toLowerCase().includes(keyword) ||
    (o.product || "").toLowerCase().includes(keyword) ||
    (o.platform || "").toLowerCase().includes(keyword)
  );
  renderOrders(result);
}

function openOrderModal() { document.getElementById("orderModal").style.display = "flex"; }
function closeOrderModal() { document.getElementById("orderModal").style.display = "none"; }

async function submitOrder() {
  const customer = document.getElementById("customerInput").value;
  const product = document.getElementById("productInput").value;
  const platform = document.getElementById("platformInput").value;
  const amount = document.getElementById("amountInput").value;
  if (!customer) return alert("请输入客户");
  await api("/api/orders/create", {
    method: "POST",
    body: JSON.stringify({
      customer, product, platform,
      quantity: 1,
      amount_cny: amount,
      amount_vnd: 0,
      platform_order_id: "",
      tracking_number: "",
      warehouse: "",
      status: "待处理",
      note: ""
    })
  });
  closeOrderModal();
  loadOrders();
}

async function editOrder(id) {
  const order = ALL_ORDERS.find(o => o.id == id);
  if (!order) return;
  const customer = prompt("客户", order.customer);
  const product = prompt("商品", order.product);
  const platform = prompt("平台", order.platform);
  const amount = prompt("金额", order.amount_cny);
  await api("/api/orders/update/" + id, { method: "PUT", body: JSON.stringify({ customer, product, platform, amount_cny: amount, status: order.status }) });
  loadOrders();
}

async function deleteOrder(id) {
  if (USER.role !== "admin") return alert("只有管理员可删除");
  if (!confirm("确定删除订单？")) return;
  await api("/api/orders/delete/" + id, { method: "DELETE" });
  loadOrders();
}

async function changeStatus(id) {
  const order = ALL_ORDERS.find(o => o.id == id);
  if (!order) return;
  const status = prompt("输入状态", order.status);
  if (!status) return;
  await api("/api/orders/update/" + id, { method: "PUT", body: JSON.stringify({ customer: order.customer, product: order.product, platform: order.platform, amount_cny: order.amount_cny, status }) });
  loadOrders();
}

// ---------------------
// 客户管理
// ---------------------
async function loadCustomers() {
  const res = await api("/api/customers");
  if (!res) return;
  ALL_CUSTOMERS = res;
  renderCustomers(res);
}

function renderCustomers(customers) {
  const box = document.getElementById("customersList");
  box.innerHTML = "";
  customers.forEach(c => {
    let buttons = USER.role === "admin" ? `<button onclick="deleteCustomer(${c.id})">删除</button>` : "";
    const html = `<div class="order-card">
      <h3>${c.name || ""}</h3>
      <p>联系方式：${c.contact || ""}</p>
      <p>地址：${c.address || ""}</p>
      <div class="order-buttons">${buttons}</div>
    </div>`;
    box.innerHTML += html;
  });
}

function searchCustomers(keyword) {
  keyword = keyword.toLowerCase();
  const result = ALL_CUSTOMERS.filter(c => (c.name || "").toLowerCase().includes(keyword) || (c.contact || "").toLowerCase().includes(keyword));
  renderCustomers(result);
}

async function createCustomer() {
  const name = prompt("客户名称"); if (!name) return;
  const contact = prompt("联系方式");
  const address = prompt("地址");
  const note = prompt("备注");
  await api("/api/customers/create", { method: "POST", body: JSON.stringify({ name, contact, address, note }) });
  loadCustomers();
}

async function deleteCustomer(id) {
  if (USER.role !== "admin") return alert("只有管理员可删除");
  if (!confirm("确定删除客户？")) return;
  await api("/api/customers/delete/" + id, { method: "DELETE" });
  loadCustomers();
}

// ---------------------
// 包裹管理
// ---------------------
async function loadPackages() {
  const res = await api("/api/warehouse");
  if (!res) return;
  ALL_PACKAGES = res;
  renderPackages(res);
}

function renderPackages(packages) {
  const box = document.getElementById("packagesList");
  const archive = document.getElementById("packageArchive");
  box.innerHTML = "";
  archive.innerHTML = "";
  let arrived = 0, shipped = 0, totalFee = 0;
  packages.forEach(item => {
    if(item.warehouse_status==="已到仓") arrived++;
    if(item.warehouse_status==="已发货") shipped++;
    totalFee += Number(item.shipping_fee || 0);

    let buttons = `<button onclick="changePackageStatus(${item.id})">状态</button>`;
    if(USER.role==="admin"||USER.role==="warehouse"){
      buttons += `<button onclick="editPackage(${item.id})">编辑</button><button onclick="deletePackage(${item.id})">删除</button>`;
    }

    const html = `<div class="order-card">
      <h3>${item.customer || ""}</h3>
      <p>快递单号：${item.tracking_number || ""}</p>
      <p>运费：¥ ${item.shipping_fee || 0}</p>
      <p>重量：${item.weight || 0} KG</p>
      <p>状态：${item.warehouse_status || ""}</p>
      <p>备注：${item.warehouse_note || ""}</p>
      <div class="order-buttons">${buttons}</div>
    </div>`;

    if(item.warehouse_status==="已完成") archive.innerHTML += html;
    else box.innerHTML += html;
  });
  document.getElementById("packageTotal").innerText = packages.length;
  document.getElementById("packageArrived").innerText = arrived;
  document.getElementById("packageShipped").innerText = shipped;
  document.getElementById("packageFeeTotal").innerText = "¥ " + totalFee;
}

function searchPackages(keyword) {
  keyword = keyword.toLowerCase();
  const result = ALL_PACKAGES.filter(item => (item.customer||"").toLowerCase().includes(keyword) || (item.tracking_number||"").toLowerCase().includes(keyword));
  renderPackages(result);
}

function openPackageModal(){ document.getElementById("packageModal").style.display="flex"; }
function closePackageModal(){ document.getElementById("packageModal").style.display="none"; }

async function submitPackage() {
  const customer = document.getElementById("packageCustomer").value;
  const tracking = document.getElementById("packageTracking").value;
  const fee = document.getElementById("packageFee").value;
  const weight = document.getElementById("packageWeight").value;
  const status = document.getElementById("packageStatus").value;
  const note = document.getElementById("packageNote").value;
  if(!customer) return alert("请输入客户");
  await api("/api/warehouse/create",{method:"POST",body:JSON.stringify({order_id:0,customer,product:"",tracking_number:tracking,warehouse_status:status,shelf_code:"",weight,shipping_fee:fee,warehouse_note:note})});
  closePackageModal(); loadPackages();
}

async function editPackage(id){
  const item = ALL_PACKAGES.find(p=>p.id==id);
  if(!item) return;
  const fee = prompt("运费", item.shipping_fee);
  const weight = prompt("重量", item.weight);
  const note = prompt("备注", item.warehouse_note);
  await api("/api/warehouse/update/"+id,{method:"PUT",body:JSON.stringify({warehouse_status:item.warehouse_status,shelf_code:"",weight,shipping_fee:fee,warehouse_note:note})});
  loadPackages();
}

async function deletePackage(id){
  if(USER.role!=="admin"&&USER.role!=="warehouse") return alert("没有权限");
  if(!confirm("确定删除包裹？")) return;
  await api("/api/warehouse/delete/"+id,{method:"DELETE"});
  loadPackages();
}

async function changePackageStatus(id){
  const item = ALL_PACKAGES.find(p=>p.id==id);
  if(!item) return;
  const status = prompt("输入状态", item.warehouse_status);
  if(!status) return;
  await api("/api/warehouse/update/"+id,{method:"PUT",body:JSON.stringify({warehouse_status:status,shelf_code:"",weight:item.weight,shipping_fee:item.shipping_fee,warehouse_note:item.warehouse_note})});
  loadPackages();
}

// ---------------------
// 财务管理
// ---------------------
function updateFinance(orders){
  let totalRevenue=0;
  orders.forEach(o=>totalRevenue+=Number(o.amount_cny||0));
  let totalProfit = totalRevenue*0.2;
  const rate = totalRevenue>0?(totalProfit/totalRevenue*100).toFixed(1):0;
  document.getElementById("todayRevenue").innerText = "¥"+totalRevenue;
  document.getElementById("todayOrders").innerText = orders.length;
  document.getElementById("monthProfit").innerText = "¥"+totalProfit;
  document.getElementById("financeRevenue").innerText = "¥"+totalRevenue;
  document.getElementById("financeProfit").innerText = "¥"+totalProfit;
  document.getElementById("profitRate").innerText = rate+"%";
}

function exportCSV(){
  let csv="客户,商品,平台,金额,状态\n";
  ALL_ORDERS.forEach(o=>csv+=`${o.customer},${o.product},${o.platform},${o.amount_cny},${o.status}\n`);
  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download="orders.csv"; a.click();
}

function toggleTheme(){ document.body.classList.toggle("light-mode"); }

function changeLanguage(lang){
  if(lang==="vi") alert("Đã chuyển sang tiếng Việt");
  else if(lang==="en") alert("Switched to English");
  else alert("已切换中文");
}

// ---------------------
// 启动加载
// ---------------------
loadOrders();
loadCustomers();
loadPackages();
