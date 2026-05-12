const API =
"https://apibuy.okla.de5.net"

let ALL_ORDERS = []
let ALL_CUSTOMERS = []

// 页面切换

function showPage(pageId){

  document
  .querySelectorAll(".page")
  .forEach(page => {

    page.classList.remove("active")

  })

  document
  .getElementById(pageId)
  .classList.add("active")

}

// 加载订单

async function loadOrders(){

  try{

    const res =
    await fetch(
      API + "/api/orders"
    )

    const orders =
    await res.json()

    ALL_ORDERS = orders

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
  document.getElementById("ordersList")

  const archive =
  document.getElementById("archiveOrders")

  if(!box) return

  box.innerHTML = ""
  archive.innerHTML = ""

  orders.forEach(order => {

    const html = `

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

        <button onclick="editOrder(${order.id})">
          编辑
        </button>

        <button onclick="deleteOrder(${order.id})">
          删除
        </button>

        <button onclick="changeStatus(${order.id})">
          状态
        </button>

        <button onclick="copyNotify(${order.id})">
          通知物流
        </button>

      </div>

    </div>
    `

    if(order.status === "已完成"){

      archive.innerHTML += html

    }

    else{

      box.innerHTML += html

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

// 打开弹窗

function openOrderModal(){

  document
  .getElementById("orderModal")
  .style.display =
  "flex"

}

// 关闭弹窗

function closeOrderModal(){

  document
  .getElementById("orderModal")
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

  await fetch(

    API + "/api/orders/create",

    {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

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

  const ok =
  confirm("确定删除订单？")

  if(!ok) return

  await fetch(

    API + "/api/orders/delete/" + id,

    {
      method:"DELETE"
    }

  )

  loadOrders()

}

// 编辑订单

async function editOrder(id){

  const order =
  ALL_ORDERS.find(o => o.id == id)

  if(!order) return

  const customer =
  prompt("客户", order.customer)

  const product =
  prompt("商品", order.product)

  const platform =
  prompt("平台", order.platform)

  const amount =
  prompt("金额", order.amount_cny)

  await fetch(

    API + "/api/orders/update/" + id,

    {

      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

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

// 状态

async function changeStatus(id){

  const order =
  ALL_ORDERS.find(o => o.id == id)

  if(!order) return

  const status =
  prompt(
    "输入状态",
    order.status
  )

  if(!status) return

  await fetch(

    API + "/api/orders/status/" + id,

    {

      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        status
      })

    }

  )

  loadOrders()

}

// 物流通知

function copyNotify(id){

  const order =
  ALL_ORDERS.find(o => o.id == id)

  if(!order) return

  const text =

`Khách hàng: ${order.customer}

Sản phẩm: ${order.product}

Nền tảng: ${order.platform}`

  navigator.clipboard.writeText(text)

  alert("已复制物流通知")

}

// 财务统计

function updateFinance(orders){

  let totalRevenue = 0

  let totalProfit = 0

  let totalOrders =
  orders.length

  orders.forEach(order => {

    totalRevenue +=
    Number(order.amount_cny || 0)

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

// 图表

function renderCharts(orders){

  const labels = []
  const data = []

  orders.forEach(order => {

    labels.push(order.customer)

    data.push(
      Number(order.amount_cny || 0)
    )

  })

  const salesChart =
  document.getElementById("salesChart")

  if(salesChart){

    new Chart(salesChart, {

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

}

// 客户

async function loadCustomers(){

  try{

    const res =
    await fetch(
      API + "/api/customers"
    )

    const customers =
    await res.json()

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

    box.innerHTML += `

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

      <p>
        累计消费：
        ¥ ${customer.total_spent || 0}
      </p>

      <p>
        订单数量：
        ${customer.total_orders || 0}
      </p>

      <div class="order-buttons">

        <button
          onclick="deleteCustomer(${customer.id})"
        >
          删除
        </button>

      </div>

    </div>

    `

  })

}

function searchCustomers(keyword){

  keyword =
  keyword.toLowerCase()

  const result =

  ALL_CUSTOMERS.filter(customer => {

    return (

      (customer.name || "")
      .toLowerCase()
      .includes(keyword)

      ||

      (customer.contact || "")
      .toLowerCase()
      .includes(keyword)

    )

  })

  renderCustomers(result)

}

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

  await fetch(

    API + "/api/customers/create",

    {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

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

async function deleteCustomer(id){

  const ok =
  confirm("确定删除客户？")

  if(!ok) return

  await fetch(

    API + "/api/customers/delete/" + id,

    {
      method:"DELETE"
    }

  )

  loadCustomers()

}

// Excel

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
  new Blob([csv], {
    type:"text/csv"
  })

  const url =
  URL.createObjectURL(blob)

  const a =
  document.createElement("a")

  a.href = url

  a.download =
  "orders.csv"

  a.click()

}

// 深色模式

function toggleTheme(){

  document.body
  .classList.toggle(
    "light-mode"
  )

}

// 多语言

function changeLanguage(lang){

  if(lang === "vi"){

    alert("Đã chuyển sang tiếng Việt")

  }

  else if(lang === "en"){

    alert("Switched to English")

  }

  else{

    alert("已切换中文")

  }

}

// 退出

function logout(){

  localStorage.removeItem(
    "erp_login"
  )

  location.href =
  "login.html"

}

// 启动

loadOrders()
loadCustomers()
