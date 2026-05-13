const API = "https://apibuy.okla.de5.net";

const TOKEN = localStorage.getItem("erp_token");
const USER = JSON.parse(localStorage.getItem("erp_user") || "{}");

if(!TOKEN) location.href = "login.html";

// ---------------------
// API 请求
// ---------------------
async function api(url, options={}) {
  options.headers = { ...(options.headers||{}), Authorization: "Bearer "+TOKEN, "Content-Type":"application/json"};
  const res = await fetch(API+url, options);
  if(res.status === 401) logout();
  return res.json();
}

// ---------------------
// 页面切换
// ---------------------
function showPage(pageId){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// ---------------------
// 权限控制菜单
// ---------------------
function applyRolePermissions(){
  const menuButtons = document.querySelectorAll(".sidebar .menu button");
  menuButtons.forEach(btn=>{
    const pageId = btn.getAttribute("onclick").match(/'(\w+)'/)[1];
    btn.style.display = "none";
    if(USER.role==="admin") btn.style.display="block";
    else if(USER.role==="finance" && pageId==="finance") btn.style.display="block";
    else if(USER.role==="warehouse" && pageId==="packages") btn.style.display="block";
    else if(USER.role==="staff" && (pageId==="orders" || pageId==="customers")) btn.style.display="block";
  });
  const firstVisible = document.querySelector(".sidebar .menu button[style*='block']");
  if(firstVisible){
    const pageId = firstVisible.getAttribute("onclick").match(/'(\w+)'/)[1];
    showPage(pageId);
  }
}
window.addEventListener("DOMContentLoaded", applyRolePermissions);

// ---------------------
// 退出登录
// ---------------------
function logout(){
  localStorage.removeItem("erp_token");
  localStorage.removeItem("erp_user");
  localStorage.removeItem("erp_login");
  location.href = "login.html";
}

// ---------------------
// 数据初始化
// ---------------------
let ALL_ORDERS=[],ALL_CUSTOMERS=[],ALL_PACKAGES=[];

// 后续函数：loadOrders/loadCustomers/loadPackages/renderOrders/renderCustomers/renderPackages
// submitOrder/submitPackage/createCustomer/edit/delete/changeStatus等
// 与 V11 app.js 相同，按钮显示/隐藏由 applyRolePermissions 控制
