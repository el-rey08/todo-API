require("./config/DBC");
const express = require('express');
const app = express()
const router = require('./router/userRouter')
const todoRouter = require('./router/todoRouter')
app.use(express.json());
app.use('/api/v1/user/',router)
app.use('/api/v1/todo/', todoRouter)
const port = process.env.port||5667
app.listen(port,()=>{
    console.log(`server is running on port: ${port}`)
})