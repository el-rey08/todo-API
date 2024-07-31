const mogoose = require('mongoose')
require('dotenv').config()
const url = process.env.DATABASE_URL
mogoose.connect(url).then(()=>{
console.log('connction to database is successfull')
})
.catch((error)=>{
console.log('error connceting to database', error.message)
})