const QuickBooks = require('node-quickbooks')

const qbo = new QuickBooks(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REFRESH_ACCESS_TOKEN,
  false,
  process.env.REALM_ID,
  true,
  true,
  null,
  '2.0',
  process.env.REFRESH_TOKEN
)


qbo.findCustomers({
  fetchAll: true
}, function (e, customers) {
  console.log(customers)
})