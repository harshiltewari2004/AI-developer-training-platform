const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true
    },
})

module.exports = mongoose.model('Topic', topicSchema);