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

// 首页图表
const ctx1 = document
  .getElementById('salesChart')

new Chart(ctx1, {

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

// 财务图表
const ctx2 = document
  .getElementById('financeChart')

new Chart(ctx2, {

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
