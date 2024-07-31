const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
title:{
        type:String,
        require:true,
        trim:true
    },
    content:{
        type:String,
        require:true,
    },
    
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'user'
    }
},{timestamps:true})

const userModel = mongoose.model('todo', userSchema)
module.exports = userModel