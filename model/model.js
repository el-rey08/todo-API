const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
    fullname:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    blacklist:[],
    todo:[{
        type:mongoose.Schema.ObjectId,
        ref:'todo'
    }]
},{timestamps:true})

const todoModel = mongoose.model('user', todoSchema)
module.exports = todoModel