const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
      ],
    },
    time_taken: {
      type: Number,
    },
    source: {
      type: String,
      enum: ["manual", "codeforces"],
      default: "manual",
    },
    cf_submission_id: {
      type: Number,
      default: null,
    },
    cf_language: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

submissionSchema.index(
    { user: 1, cf_submission_id: 1 },
    { unique: true, sparse: true }  
);

module.exports = mongoose.model("Submission", submissionSchema);
