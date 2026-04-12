const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        required:true,
        enum:['Easy','Medium','Hard']
    },
    platform:{
        type:String,
        required:true
    }
    ,link:{
        type:String,
        required:true
    },
    topics:[
        {type:mongoose.Schema.Types.ObjectId,ref:'Topic'}
    ]
});

module.exports = mongoose.model('Problem', problemSchema);