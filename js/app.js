/* 全局 */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0d1b34;
  color: #fff;
}

/* 左侧菜单 */
#sidebar {
  width: 200px;
  background: #071026;
  float: left;
  height: 100vh;
  position: fixed;
}

#sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

#sidebar li {
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #0a1530;
}

#sidebar li:hover {
  background: #0b1a3c;
}

#sidebar li.active {
  background: #1e90ff;
}

/* 主内容区 */
#main {
  margin-left: 200px; /* 留出侧边栏宽度 */
  padding: 20px;
}

/* 模块通用 */
.module.hidden {
  display: none;
}

.module {
  padding: 10px;
  background: #0d1b34;
  border-radius: 12px;
}

/* 按钮样式 */
button {
  padding: 6px 12px;
  margin: 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.btn-primary {
  background: #1e90ff;
  color: #fff;
}

button.btn-danger {
  background: #ff4d4f;
  color: #fff;
}

/* 输入框、下拉框 */
input, select {
  padding: 5px;
  margin: 2px;
  border-radius: 4px;
  border: none;
  background: #0b1a3c;
  color: #fff;
}

/* 订单表格 */
.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.order-table th, .order-table td {
  border: 1px solid #0a1530;
  padding: 8px;
  text-align: center;
}

.order-table th {
  background-color: #0b1a3c;
  color: #ffffff;
}

.order-table tr:nth-child(even) {
  background-color: #0d1b34;
}

.order-table tr:nth-child(odd) {
  background-color: #0c1830;
}

/* flex 行布局（可复用其他模块列表） */
.flex-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #0a1530;
}

.flex-row > div {
  flex: 1;
  text-align: center;
}

/* 标题 */
h2 {
  margin-top: 0;
  margin-bottom: 10px;
}

/* 空表提示 */
.module p {
  padding: 10px;
  text-align: center;
  color: #ccc;
}
