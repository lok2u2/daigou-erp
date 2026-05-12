const API =
"https://apibuy.okla.de5.net"

// 页面切换

function showPage(pageId){

  document
    .querySelectorAll('.page')
    .forEach(page => {

      page.classList.remove('active')

    })

  document
    .getElementById(pageId)
    .classList.add('active')

}

// =========================
// 图表
// =========================

const salesChart =
document.getElementById('salesChart')

if(salesChart){

  new Chart(salesChart, {

    type:'bar',

    data:{

      labels:[
        '周一',
        '周二',
        '周三',
        '周四',
        '周五'
      ],

      datasets:[{

        label:'营业额',

        data:[
          120,
          190,
          300,
          250,
          400
        ]

      }]

    }

  })

}

const financeChart =
document.getElementById('financeChart')

if(financeChart){

  new Chart(financeChart, {

    type:'line',

    data:{

      labels:[
        '1月',
        '2月',
        '3月',
        '4月'
      ],

      datasets:[{

        label:'利润',

        data:[
          500,
          800,
          650,
          1200
        ]

      }]

    }

  })

}

// =========================
// 获取订单
// =========================

async function loadOrders(){

  const box =
  document.getElementById("ordersList")

  if(!box) return

  box.innerHTML =
  "加载中..."

  try{

    const res =
    await fetch(

      API + "/api/orders"

    )

    const orders =
    await res.json()

    // 空数据

    if(orders.length === 0){

      box.innerHTML =
      "<p>暂无订单</p>"

      return

    }

    // 渲染

    box.innerHTML =
    ""

    orders.forEach(order => {

      box.innerHTML += `

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
            onclick="deleteOrder(${order.id})"
          >
            删除
          </button>

          <button
            onclick="copyNotify(${order.id})"
          >
            通知物流
          </button>

        </div>

      </div>

      `

    })

  }

  catch(err){

    box.innerHTML =
    "订单加载失败"

  }

}

// =========================
// 新增订单
// =========================

async function createOrder(){

  const customer =
  prompt("客户名称")

  if(!customer) return

  const product =
  prompt("商品名称")

  const platform =
  prompt("平台（淘宝/拼多多等）")

  const amount =
  prompt("金额")

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

  alert("新增成功")

  loadOrders()

}

// =========================
// 删除订单
// =========================

async function deleteOrder(id){

  const ok =
  confirm("确定删除？")

  if(!ok) return

  await fetch(

    API + "/api/orders/delete/" + id,

    {

      method:"DELETE"

    }

  )

  loadOrders()

}

// =========================
// 通知物流
// =========================

async function copyNotify(id){

  const res =
  await fetch(

    API + "/api/orders"

  )

  const orders =
  await res.json()

  const order =
  orders.find(o => o.id == id)

  if(!order) return

  const text =

`Khách hàng: ${order.customer}

Sản phẩm: ${order.product}

Nền tảng: ${order.platform}

Vui lòng gửi hàng về Hà Nội.`

  navigator.clipboard.writeText(text)

  alert("已复制越南文通知")

}

// 启动

loadOrders()
