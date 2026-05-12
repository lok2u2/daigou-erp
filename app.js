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

let ALL_PACKAGES = []

// =========================
// 订单
// =========================

// 加载订单

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

// 渲染订单

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
          USER.role === "admin"

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

// 搜索订单

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

// 打开订单弹窗

function openOrderModal(){

  document
  .getElementById(
    "orderModal"
  )
  .style.display =
  "flex"

}

// 关闭订单弹窗

function closeOrderModal(){

  document
  .getElementById(
    "orderModal"
  )
  .style.display =
  "none"

}

// 新增订单

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

// 删除订单

async function deleteOrder(id){

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

// 编辑订单

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

// 修改订单状态

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
// 客户
// =========================

// 加载客户

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

// 渲染客户

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

// 搜索客户

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

// 新增客户

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

// 删除客户

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
// 包裹管理
// =========================

// 加载包裹

async function loadPackages(){

  try{

    const packages =
    await api("/api/warehouse")

    if(!packages) return

    ALL_PACKAGES =
    packages

    renderPackages(packages)

  }

  catch(err){

    console.log(err)

  }

}

// 渲染包裹

function renderPackages(packages){

  const box =
  document.getElementById(
    "packagesList"
  )

  const archive =
  document.getElementById(
    "packageArchive"
  )

  if(!box) return

  box.innerHTML = ""
  archive.innerHTML = ""

  let arrived = 0
  let shipped = 0
  let totalFee = 0

  packages.forEach(item => {

    if(
      item.warehouse_status ===
      "已到仓"
    ){

      arrived++

    }

    if(
      item.warehouse_status ===
      "已发货"
    ){

      shipped++

    }

    totalFee +=
    Number(
      item.shipping_fee || 0
    )

    const html =

    `
    <div class="order-card">

      <h3>
        ${item.customer || ""}
      </h3>

      <p>
        快递单号：
        ${item.tracking_number || ""}
      </p>

      <p>
        运费：
        ¥ ${item.shipping_fee || 0}
      </p>

      <p>
        重量：
        ${item.weight || 0} KG
      </p>

      <p>
        状态：
        ${item.warehouse_status || ""}
      </p>

      <p>
        备注：
        ${item.warehouse_note || ""}
      </p>

      <div class="order-buttons">

        <button
          onclick="editPackage(${item.id})"
        >
          编辑
        </button>

        <button
          onclick="changePackageStatus(${item.id})"
        >
          状态
        </button>

        ${
          USER.role === "admin"

          ?

          `
          <button
            onclick="deletePackage(${item.id})"
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

    if(

      item.warehouse_status ===
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

  document.getElementById(
    "packageTotal"
  ).innerText =
  packages.length

  document.getElementById(
    "packageArrived"
  ).innerText =
  arrived

  document.getElementById(
    "packageShipped"
  ).innerText =
  shipped

  document.getElementById(
    "packageFeeTotal"
  ).innerText =
  "¥ " + totalFee

}

// 搜索包裹

function searchPackages(keyword){

  keyword =
  keyword.toLowerCase()

  const result =

  ALL_PACKAGES.filter(item => {

    return (

      (item.customer || "")
      .toLowerCase()
      .includes(keyword)

      ||

      (item.tracking_number || "")
      .toLowerCase()
      .includes(keyword)

    )

  })

  renderPackages(result)

}

// 打开包裹弹窗

function openPackageModal(){

  document
  .getElementById(
    "packageModal"
  )
  .style.display =
  "flex"

}

// 关闭包裹弹窗

function closePackageModal(){

  document
  .getElementById(
    "packageModal"
  )
  .style.display =
  "none"

}

// 新增包裹

async function submitPackage(){

  const customer =
  document.getElementById(
    "packageCustomer"
  ).value

  const tracking =
  document.getElementById(
    "packageTracking"
  ).value

  const fee =
  document.getElementById(
    "packageFee"
  ).value

  const weight =
  document.getElementById(
    "packageWeight"
  ).value

  const status =
  document.getElementById(
    "packageStatus"
  ).value

  const note =
  document.getElementById(
    "packageNote"
  ).value

  if(!customer){

    alert("请输入客户")

    return

  }

  await api(

    "/api/warehouse/create",

    {

      method:"POST",

      body:JSON.stringify({

        order_id:0,

        customer,

        product:"",

        tracking_number:
        tracking,

        warehouse_status:
        status,

        shelf_code:"",

        weight,

        shipping_fee:fee,

        warehouse_note:
        note

      })

    }

  )

  closePackageModal()

  loadPackages()

}

// 删除包裹

async function deletePackage(id){

  if(
    USER.role !== "admin"
  ){

    alert(
      "只有管理员可删除"
    )

    return

  }

  const ok =
  confirm("确定删除包裹？")

  if(!ok) return

  await api(

    "/api/warehouse/delete/" + id,

    {
      method:"DELETE"
    }

  )

  loadPackages()

}

// 编辑包裹

async function editPackage(id){

  const item =
  ALL_PACKAGES.find(
    p => p.id == id
  )

  if(!item) return

  const fee =
  prompt(
    "运费",
    item.shipping_fee
  )

  const weight =
  prompt(
    "重量",
    item.weight
  )

  const note =
  prompt(
    "备注",
    item.warehouse_note
  )

  await api(

    "/api/warehouse/update/" + id,

    {

      method:"PUT",

      body:JSON.stringify({

        warehouse_status:
        item.warehouse_status,

        shelf_code:"",

        weight,

        shipping_fee:fee,

        warehouse_note:
        note

      })

    }

  )

  loadPackages()

}

// 修改包裹状态

async function changePackageStatus(id){

  const item =
  ALL_PACKAGES.find(
    p => p.id == id
  )

  if(!item) return

  const status =
  prompt(

    "输入状态",

    item.warehouse_status

  )

  if(!status) return

  await api(

    "/api/warehouse/update/" + id,

    {

      method:"PUT",

      body:JSON.stringify({

        warehouse_status:
        status,

        shelf_code:"",

        weight:
        item.weight,

        shipping_fee:
        item.shipping_fee,

        warehouse_note:
        item.warehouse_note

      })

    }

  )

  loadPackages()

}

// =========================
// 财务
// =========================

function updateFinance(orders){

  let totalRevenue = 0
  let totalProfit = 0

  orders.forEach(order => {

    totalRevenue +=

    Number(
      order.amount_cny || 0
    )

  })

  totalProfit =
  totalRevenue * 0.2

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

  document.getElementById(
    "todayRevenue"
  ).innerText =
  "¥ " + totalRevenue

  document.getElementById(
    "todayOrders"
  ).innerText =
  orders.length

  document.getElementById(
    "monthProfit"
  ).innerText =
  "¥ " + totalProfit

  document.getElementById(
    "financeRevenue"
  ).innerText =
  "¥ " + totalRevenue

  document.getElementById(
    "financeProfit"
  ).innerText =
  "¥ " + totalProfit

  document.getElementById(
    "profitRate"
  ).innerText =
  rate + "%"

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

loadPackages()
