const mongoose = require('mongoose');
const Submission = require('../models/Submission.js');
const Problem = require('../models/Problem.js');


module.exports.createSubmission = async(req,res)=>{
    try{
        const{problemId,status,time_taken}=req.body;

        const problem = await Problem.findById(problemId);
        if(!problem){
            return res.status(404).json({message:"Problem not found"});
        }

        const submission = await Submission.create({
            user:req.userId,
            problem:problemId,
            status,
            time_taken
        });
        res.status(201).json({success:true,submission});
    }
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};

module.exports.getMySubmissions = async(req,res)=>{
    try{
        const submissions = await Submission.find({user:req.userId})
        .populate('problem','title difficulty platform link')
        .sort({submittedAt:-1});

        res.status(200).json({success:true,submissions});
    }
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
}

module.exports.getSubmissionsForProblem = async(req,res)=>{
    try{
        const submissions = await Submission.find({
            user:req.userId,
            problem:req.params.problemId
        }).populate('problem','title difficulty platform link')
           .sort({submittedAt:-1});

           res.status(200).json({success:true,submissions});
    }
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};

module.exports.getMyStats = async(req,res)=>{
    try{
        const submissions = await Submission.find({user:req.userId})
        .populate('problem','difficulty');

        const total = submissions.length;
        const accepted = submissions.filter(s=>s.status==="Accepted").length;
        const byDifficulty = {Easy:0,Medium:0,Hard:0};

        submissions.filter(s=>s.status==="Accepted")
        .forEach(s=>{
            const diff = s.problem?.difficulty;
            if(diff && byDifficulty[diff]!==undefined){
                byDifficulty[diff]++;
            }
        });

        const acceptedWithTime = submissions.filter(
            s=>s.status==="Accepted" && s.time_taken
        );

        const avgTime = acceptedWithTime.length?
        Math.round(
            acceptedWithTime.reduce((sum,s)=>sum+s.time_taken,0)
            /acceptedWithTime.length
        ):null;
        res.status(200).json(
            {
                success:true,
                stats:{
                    total_submissions:total,
                    accepted_rate:total?Math.round((accepted/total)*100):0,
                    solved_by_difficulty:byDifficulty,
                    avg_time_taken_minutes:avgTime
                }
            }
        );
    }
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};

module.exports.getTopicAccuracy = async(req,res)=>{
    try{
        const userId = req.userId;

        const accuracy = await Submission.aggregate([
            {
                $match:{
                    user:new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group:{
                    _id:'$problem',
                    solved:{
                        $max:{
                            $cond:[{$eq:['$status','Accepted']},1,0]
                        }
                    },
                    attempted:{$max:1}
                }
            },
            {
                $lookup:{
                    from:'problems',
                    localField:'_id',
                    foreignField:'_id',
                    as:'problemData'
                }
            },
            {$unwind:'$problemData'},
            {$unwind:'$problemData.topics'},
            {
                $group:{
                    _id:'$problemData.topics',
                    solved:{$sum:'$solved'},
                    attempted:{$sum:'$attempted'}
                }
            },
            {
                $lookup:{
                    from:'topics',
                    localField:'_id',
                    foreignField:'_id',
                    as:'topicData'
                }
            },
            {$unwind:'$topicData'},
            {
                $project:{
                    _id:0,
                    topic:'$topicData.name',
                    solved:1,
                    attempted:1,
                    accuracy:{
                        $concat:[
                            {
                                $toString:{
                                    $round:[
                                        {
                                            $multiply:[
                                                {$divide:['$solved','$attempted']},
                                                100
                                            ]
                                        },
                                        1
                                    ]
                                }
                            },
                            '%'
                        ]
                    }
                }
            },
            {$sort:{solved:-1,attempted:-1}}
        ]);
        res.status(200).json({success:true,topic_accuracy:accuracy});
    }
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};

module.exports.getWeakTopics = async(req,res)=>{
    try{
        const userId = req.userId;
        const WEAK_THRESHOLD = parseInt(req.query.threshold)||40;

        const accuracy = await Submission.aggregate([
            {
                $match:{
                    user: new mongoose.Types.ObjectId(userId)
                }
            },
           { 
            $lookup:{
                from:'problems',
                localField:'problem',
                foreignField:'_id',
                as:'problemData'
            }
         },
         {$unwind:'$problemData'},
         {$unwind:'$problemData.topics'},
         {
            $group:{
                _id:'$problemData.topics',
                attempted:{$sum:1},
                accepted:{
                    $sum:{
                        $cond:[{$eq:['$status','Accepted']},1,0]
                    }
                }
            }
         },
         {
            $lookup:{
                from:'topics',
                localField:'_id',
                foreignField:'_id',
                as:'topicData'
            }
         },
         {$unwind:'$topicData'},
         {
            $project:{
                _id:0,
                topic:'$topicData.name',
                attempted:1,
                accepted:1,
                accuracyValue:{
                    $round:[
                        {
                            $multiply:[
                                {$divide:['$accepted','$attempted']},
                                100
                            ]
                        },
                        1
                    ]
                }
            }
         },
         {
            $match:{
                accuracyValue:{$lt:WEAK_THRESHOLD}
            }
         },
         { $sort:{accuracyValue:1}}
        ]);

        const weakTopics = accuracy.map(t=>({
            topic:t.topic,
            attempted:t.attempted,
            accepted:t.accepted,
            accuracy:`${t.accuracyValue}`,
            message:`You need more practice on ${t.topic} `
        }));
        if(weakTopics.length===0){
            return res.status(200).json({
                success:true,
                weakTopics:[],
                message:'No weak topics found.Great job!'
            });
        }
        res.status(200).json({
            success:true,
            count:weakTopics.length,
            weakTopics
        });
    }
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};

module.exports.getStrongTopics = async(req,res)=>{
   try {const userId = req.userId;
    const STRONG_THRESHOLD=parseInt(req.query.threshold)||70;

    const accuracy = await Submission.aggregate([
        {
            $match:{
                user:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:'problems',
                localField:'problem',
                foreignField:'_id',
                as:'problemData'
            }
        },
        {$unwind:'$problemData'},
        {$unwind:'$problemData.topics'},
        {
            $group:{
                _id:'$problemData.topics',
                attempted:{$sum:1},
                accepted:{
                    $sum:{
                        $cond:[{$eq:['$status','Accepted']},1,0]
                    }
                }
            }
        },
        {
            $lookup:{
                from:'topics',
                localField:'_id',
                foreignField:'_id',
                as:'topicData'
            }
        },
        {$unwind:'$topicData'},
        {
            $project:{
                _id:0,
                topic:'$topicData.name',
                attempted:1,
                accepted:1,
                accuracyValue:{
                    $round:[
                        {
                            $multiply:[
                                {$divide:['$accepted','$attempted']},
                                100
                            ]
                        },
                        1
                    ]
                }
            }
        },
        {
            $match:{
                accuracyValue:{$gt:STRONG_THRESHOLD}
            }
        },
        {$sort:{accuracyValue:-1}}
    ]);
    const strongTopics = accuracy.map(t=>({
        topic:t.topic,
        attempted:t.attempted,
        accepted:t.accepted,
        accuracy:`${t.accuracyValue}%`
    }));

    if(strongTopics.length===0){
        return res.status(200).json({
            success:true,
            strongTopics:[],
            message:'No strong topics yet keep practicing'
        });
    }
    res.status(200).json({
        success:true,
        count:strongTopics.length,
        strongTopics
    });
}
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};