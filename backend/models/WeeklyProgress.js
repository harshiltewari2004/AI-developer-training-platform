const mongoose = require('mongoose');

const weeklyProgressSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true
    },
    week:{
        type:Number,
        require:true
    },
    year:{
        type:Number,
        require:true
    },
    attempted:{
        type:Number,
        default:0
    },
    accepted:{
        type:Number,
        default:0
    },
    accuracy:{
        type:Number,
        default:0
    },
    topic_breakdown:[
        {
            topic:String,
            attempted:Number,
            accepted:Number,
            accuracy:Number,
        }
    ]
},{timestamps:true});

weeklyProgressSchema.index({user:1,week:1,year:1},{unique:true});

module.exports=mongoose.model('WeeklyProgress',weeklyProgressSchema);