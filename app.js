const API =
"https://apibuy.okla.de5.net"

// =========================
// TOKEN
// =========================

const TOKEN =
localStorage.getItem(
  "erp_token"
)

const USER =
JSON.parse(

  localStorage.getItem(
    "erp_user"
  )

  ||

  "{}"

)

// =========================
// 登录检测
// =========================

if(!TOKEN){

  location.href =
  "login.html"

}

// =========================
// 用户显示
// =========================

window.addEventListener(

  "DOMContentLoaded",

  () => {

    const topTitle =
    document.querySelector(
      ".top-title"
    )

    if(topTitle){

      topTitle.innerHTML =

      `
      SaaS ERP 管理系统

      <div
        style="
        margin-top:8px;
        font-size:14px;
        opacity:.7;
        "
      >

      当前用户：

      ${USER.username || ""}

      (${USER.role || ""})

      </div>
      `

    }

  }

)

// =========================
// API 请求
// =========================

async function api(

  url,

  options = {}

){

  // headers

  options.headers = {

    ...(options.headers || {}),

    Authorization:
    "Bearer " + TOKEN,

    "Content-Type":
    "application/json"

  }

  const res =
  await fetch(

    API + url,

    options

  )

  // token失效

  if(res.status === 401){

    logout()

    return

  }

  return res.json()

}

// =========================
// 页面切换
// =========================

function showPage(pageId){

  document
  .querySelectorAll(".page")
  .forEach(page => {

    page.classList.remove(
      "active"
    )

  })

  document
  .getElementById(pageId)
  .classList.add(
    "active"
  )

}

// =========================
// 数据
// =========================

let ALL_ORDERS = []

let ALL_CUSTOMERS = []

// =========================
// 加载订单
// =========================

async function loadOrders(){

  try{

    const orders =
    await api("/api/orders")

    if(!orders) return

    ALL_ORDERS =
    orders

    renderOrders(orders)

    updateFinance(orders)

  }

  catch(err){

    console.log(err)

  }

}

// =========================
// 渲染订单
// =========================

function renderOrders(orders){

  const box =
  document.getElementById(
    "ordersList"
  )

  const archive =
  document.getElementById(
    "archiveOrders"
  )

  if(!box) return

  box.innerHTML = ""
  archive.innerHTML = ""

  orders.forEach(order => {

    const isAdmin =
    USER.role === "admin"

    const html =

    `
    <div class="order-card">

      <h3>
        ${order.customer || ""}
      </h3>

      <p>
        商品：
        ${order.product || ""}
      </p>

      <p>
        平台：
        ${order.platform || ""}
      </p>

      <p>
        金额：
        ¥ ${order.amount_cny || 0}
      </p>

      <p>
        状态：
        ${order.status || ""}
      </p>

      <div class="order-buttons">

        <button
          onclick="editOrder(${order.id})"
        >
          编辑
        </button>

        ${
          isAdmin
          ?

          `
          <button
            onclick="deleteOrder(${order.id})"
          >
            删除
          </button>
          `
          :

          ""
        }

        <button
          onclick="changeStatus(${order.id})"
        >
          状态
        </button>

        <button
          onclick="copyNotify(${order.id})"
        >
          通知物流
        </button>

      </div>

    </div>
    `

    if(

      order.status ===
      "已完成"

    ){

      archive.innerHTML +=
      html

    }

    else{

      box.innerHTML +=
      html

    }

  })

}

// =========================
// 搜索订单
// =========================

function searchOrders(keyword){

  keyword =
  keyword.toLowerCase()

  const result =

  ALL_ORDERS.filter(order => {

    return (

      (order.customer || "")
      .toLowerCase()
      .includes(keyword)

      ||

      (order.product || "")
      .toLowerCase()
      .includes(keyword)

      ||

      (order.platform || "")
      .toLowerCase()
      .includes(keyword)

    )

  })

  renderOrders(result)

}

// =========================
// 弹窗
// =========================

function openOrderModal(){

  document
  .getElementById(
    "orderModal"
  )
  .style.display =
  "flex"

}

function closeOrderModal(){

  document
  .getElementById(
    "orderModal"
  )
  .style.display =
  "none"

}

// =========================
// 新增订单
// =========================

async function submitOrder(){

  const customer =
  document.getElementById(
    "customerInput"
  ).value

  const product =
  document.getElementById(
    "productInput"
  ).value

  const platform =
  document.getElementById(
    "platformInput"
  ).value

  const amount =
  document.getElementById(
    "amountInput"
  ).value

  if(!customer){

    alert("请输入客户")

    return

  }

  await api(

    "/api/orders/create",

    {

      method:"POST",

      body:JSON.stringify({

        customer,
        product,
        platform,

        quantity:1,

        amount_cny:amount,

        amount_vnd:0,

        platform_order_id:"",

        tracking_number:"",

        warehouse:"",

        status:"待处理",

        note:""

      })

    }

  )

  closeOrderModal()

  loadOrders()

}

// =========================
// 删除订单
// =========================

async function deleteOrder(id){

  // 管理员权限

  if(

    USER.role !== "admin"

  ){

    alert(
      "只有管理员可删除"
    )

    return

  }

  const ok =
  confirm("确定删除订单？")

  if(!ok) return

  await api(

    "/api/orders/delete/" + id,

    {
      method:"DELETE"
    }

  )

  loadOrders()

}

// =========================
// 编辑订单
// =========================

async function editOrder(id){

  const order =
  ALL_ORDERS.find(
    o => o.id == id
  )

  if(!order) return

  const customer =
  prompt(
    "客户",
    order.customer
  )

  const product =
  prompt(
    "商品",
    order.product
  )

  const platform =
  prompt(
    "平台",
    order.platform
  )

  const amount =
  prompt(
    "金额",
    order.amount_cny
  )

  await api(

    "/api/orders/update/" + id,

    {

      method:"PUT",

      body:JSON.stringify({

        customer,
        product,
        platform,

        amount_cny:amount,

        status:order.status

      })

    }

  )

  loadOrders()

}

// =========================
// 修改状态
// =========================

async function changeStatus(id){

  const order =
  ALL_ORDERS.find(
    o => o.id == id
  )

  if(!order) return

  const status =
  prompt(

    "输入状态",

    order.status

  )

  if(!status) return

  await api(

    "/api/orders/update/" + id,

    {

      method:"PUT",

      body:JSON.stringify({

        customer:
        order.customer,

        product:
        order.product,

        platform:
        order.platform,

        amount_cny:
        order.amount_cny,

        status

      })

    }

  )

  loadOrders()

}

// =========================
// 通知物流
// =========================

function copyNotify(id){

  const order =
  ALL_ORDERS.find(
    o => o.id == id
  )

  if(!order) return

  const text =

`Khách hàng:
${order.customer}

Sản phẩm:
${order.product}

Nền tảng:
${order.platform}

Trạng thái:
${order.status}`

  navigator.clipboard
  .writeText(text)

  alert("物流通知已复制")

}

// =========================
// 财务
// =========================

function updateFinance(orders){

  let totalRevenue = 0

  let totalProfit = 0

  let totalOrders =
  orders.length

  orders.forEach(order => {

    totalRevenue +=

    Number(
      order.amount_cny || 0
    )

  })

  totalProfit =
  totalRevenue * 0.2

  const vnd =
  totalRevenue * 3500

  const rate =

  totalRevenue > 0

  ?

  (
    totalProfit
    /
    totalRevenue
    * 100
  ).toFixed(1)

  :

  0

  // 首页

  document.getElementById(
    "todayRevenue"
  ).innerText =
  "¥ " + totalRevenue

  document.getElementById(
    "todayOrders"
  ).innerText =
  totalOrders

  document.getElementById(
    "monthProfit"
  ).innerText =
  "¥ " + totalProfit

  // 财务页

  document.getElementById(
    "financeRevenue"
  ).innerText =
  "¥ " + totalRevenue

  document.getElementById(
    "financeProfit"
  ).innerText =
  "¥ " + totalProfit

  document.getElementById(
    "financeVND"
  ).innerText =
  "₫ " + vnd.toLocaleString()

  document.getElementById(
    "profitRate"
  ).innerText =
  rate + "%"

  renderCharts(orders)

}

// =========================
// 图表
// =========================

let salesChart = null

function renderCharts(orders){

  const labels = []
  const data = []

  orders.forEach(order => {

    labels.push(
      order.customer
    )

    data.push(

      Number(
        order.amount_cny || 0
      )

    )

  })

  const ctx =
  document.getElementById(
    "salesChart"
  )

  if(!ctx) return

  if(salesChart){

    salesChart.destroy()

  }

  salesChart =

  new Chart(ctx, {

    type:"bar",

    data:{

      labels,

      datasets:[{

        label:"营业额",

        data

      }]

    }

  })

}

// =========================
// 客户
// =========================

async function loadCustomers(){

  try{

    const customers =
    await api(
      "/api/customers"
    )

    if(!customers) return

    ALL_CUSTOMERS =
    customers

    renderCustomers(customers)

  }

  catch(err){

    console.log(err)

  }

}

function renderCustomers(customers){

  const box =
  document.getElementById(
    "customersList"
  )

  if(!box) return

  box.innerHTML = ""

  customers.forEach(customer => {

    box.innerHTML +=

    `
    <div class="order-card">

      <h3>
        ${customer.name || ""}
      </h3>

      <p>
        联系方式：
        ${customer.contact || ""}
      </p>

      <p>
        地址：
        ${customer.address || ""}
      </p>

      <div class="order-buttons">

        ${
          USER.role === "admin"

          ?

          `
          <button
            onclick="deleteCustomer(${customer.id})"
          >
            删除
          </button>
          `
          :

          ""
        }

      </div>

    </div>
    `

  })

}

function searchCustomers(keyword){

  keyword =
  keyword.toLowerCase()

  const result =

  ALL_CUSTOMERS.filter(c => {

    return (

      (c.name || "")
      .toLowerCase()
      .includes(keyword)

      ||

      (c.contact || "")
      .toLowerCase()
      .includes(keyword)

    )

  })

  renderCustomers(result)

}

// =========================
// 新增客户
// =========================

async function createCustomer(){

  const name =
  prompt("客户名称")

  if(!name) return

  const contact =
  prompt("联系方式")

  const address =
  prompt("地址")

  const note =
  prompt("备注")

  await api(

    "/api/customers/create",

    {

      method:"POST",

      body:JSON.stringify({

        name,
        contact,
        address,
        note

      })

    }

  )

  loadCustomers()

}

// =========================
// 删除客户
// =========================

async function deleteCustomer(id){

  if(

    USER.role !== "admin"

  ){

    alert(
      "只有管理员可删除"
    )

    return

  }

  const ok =
  confirm("确定删除客户？")

  if(!ok) return

  await api(

    "/api/customers/delete/" + id,

    {
      method:"DELETE"
    }

  )

  loadCustomers()

}

// =========================
// 导出 CSV
// =========================

function exportCSV(){

  let csv =

`客户,商品,平台,金额,状态\n`

  ALL_ORDERS.forEach(order => {

    csv +=

`${order.customer},
${order.product},
${order.platform},
${order.amount_cny},
${order.status}\n`

  })

  const blob =

  new Blob(

    [csv],

    {
      type:"text/csv"
    }

  )

  const url =
  URL.createObjectURL(blob)

  const a =
  document.createElement("a")

  a.href = url

  a.download =
  "orders.csv"

  a.click()

}

// =========================
// 深色模式
// =========================

function toggleTheme(){

  document.body
  .classList.toggle(
    "light-mode"
  )

}

// =========================
// 多语言
// =========================

function changeLanguage(lang){

  if(lang === "vi"){

    alert(
      "Đã chuyển sang tiếng Việt"
    )

  }

  else if(lang === "en"){

    alert(
      "Switched to English"
    )

  }

  else{

    alert(
      "已切换中文"
    )

  }

}

// =========================
// 退出登录
// =========================

function logout(){

  localStorage.removeItem(
    "erp_token"
  )

  localStorage.removeItem(
    "erp_user"
  )

  localStorage.removeItem(
    "erp_login"
  )

  location.href =
  "login.html"

}

// =========================
// 启动
// =========================

loadOrders()

loadCustomers()
