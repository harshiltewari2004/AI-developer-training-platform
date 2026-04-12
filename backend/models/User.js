const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        sparse:true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    github_handle:{type:String},
    githubId:{type:String,unique:true,sparse:true},
    avatar:{
        type:String
    },
    authProvider:{
        type:String,
        enum:['local','github'],
        default:'local'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    github_pat: {
    type: String,
    default: null,
    select: false    // never returned in API responses for security
},
    codeforces_handle: {
        type: String,
        default: null
    },
});


userSchema.pre('save', async function () {
    if(!this.isModified('password')||!this.password)return;
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);