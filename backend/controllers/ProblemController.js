const Problem = require('../models/Problem');

module.exports.getProblems = async(req,res)=>{
    try{
        const {difficulty,platform,topic} = req.query;
        const filter = {};
        if(difficulty)
            filter.difficulty = difficulty;
        if(platform)
            filter.platform = platform;
        if(topic)
            filter.topic = topic;

        const problems = await Problem.find(filter).populate('topics','name');
        res.status(200).json({success:true,problems});
    } catch (error) {
        res.status(500).json({success:false, message: error.message });

    }
};

module.exports.getProblem = async(req,res)=>{
    try {
        const problem = await Problem.findById(req.params.id)
            .populate('topics', 'name');

        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        res.status(200).json({ success: true, problem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.createProblem = async(req,res)=>{
    try{
        const problem = await Problem.create(req.body);
        res.status(201).json({success:true,problem});
    }
        catch (error) {
        res.status(400).json({success:false, message: error.message });
        }
};

module.exports.updateProblem = async(req,res)=>{
    try{
        const problem = await Problem.findByIdAndUpdate(req.params.id,req.body,{new:true});
        res.status(200).json({success:true,problem});
    }
    catch(error){
        res.status(400).json({success:false, message: error.message });
    }
};

module.exports.deleteProblem = async(req,res)=>{
    try{
        await Problem.findByIdAndDelete(req.params.id);
        res.status(200).json({success:true, message: 'Problem deleted successfully' });
    }
    catch(error){
        res.status(400).json({success:false, message: error.message });
    }
};