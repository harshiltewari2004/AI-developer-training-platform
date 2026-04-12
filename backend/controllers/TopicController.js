const Topic = require('../models/Topic.js');
const Problem = require('../models/Problem.js');

module.exports.getTopics =async(req,res)=>{
    try{
        const topics = await Topic.find().sort({name:1});
        res.status(200).json(topics);
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        })
    }
};

module.exports.createTopic = async(req,res)=>{
    try{
        const {name} =  req.body;
        const existing = await Topic.findOne({
            name:name.toLowerCase()
        });
        if(existing){
            return res.status(400).json({success:false,message:"Topic already exists"});
        }
        const topic = await Topic.create({name:name.toLowerCase()});
        res.status(201).json({success:true,topic});
    }
    catch(err){
        res.status(400).json({success:false,message:err.message});
    }
};


module.exports.deleteTopic = async(req,res)=>{
    try{
        await Topic.findByIdAndDelete(req.params.id);

        await Problem.updateMany(
            {topics:req.params.id},
            {$pull:{topics:req.params.id} }
        );
        res.status(200).json({success:true,message:"Topic deleted and removed from problems"});
    } catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};

module.exports.addTopicToProblem = async(req,res)=>{
    try{
        const {problemId,topicId} = req.body;
        const problem = await Problem.findByIdAndUpdate(
            problemId,
            {$addToSet:{topics:topicId}},
            {new:true}
        ).populate('topics','name');
        res.status(200).json({success:true,problem});
    }
    catch(err){
        res.status(400).json({success:false,message:err.message});
    }
};

module.exports.removeTopicFromProblem = async(req,res)=>{
    try{
        const{problemId,topicId} = req.body;
        const problem = await Problem.findByIdAndUpdate(
            problemId,
            {$pull:{topics:topicId}},
            {new:true}
        ).populate('topics','name');
        res.status(200).json({success:true,problem});
    }
    catch(err){
        res.status(400).json({success:false,message:err.message});
    }
}