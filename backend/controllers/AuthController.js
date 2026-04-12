const User = require("../models/User");
const { createSecretToken } = require("../utils/SecretToken");
const bcrypt = require("bcryptjs");
const axios = require("axios");

module.exports.Signup = async (req, res, next) => {
  try {
    const { user, name, email, password, github_handle } = req.body;

    if (!user || !name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All Fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists", success: false });
    }

    const newUser = await User.create({
      user,
      name,
      email,
      password,
      github_handle,
    });
    const token = createSecretToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User signed up successfully",
      success: true,
      user: newUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field}already taken`,
      });
    }
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ message: "All fields are required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password", success: false });
    }

    const auth = await bcrypt.compare(password, existingUser.password);
    if (!auth) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password", success: false });
    }

    const token = createSecretToken(existingUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.githubLogin = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(githubAuthUrl);
};

module.exports.githubCallBack = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "No code provided by Github" });
    }
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );
    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Failed to get access token from Github",
        });
    }

    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const githubUser = profileResponse.data;

    let email = githubUser.email;
    if (!email) {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );
      const primaryEmail = emailResponse.data.find(
        (e) => e.primary && e.verified,
      );
      email = primaryEmail ? primaryEmail.email : null;
    }

    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (user) {
      user.avatar = githubUser.avatar_url;
      await user.save();
    } else {
      if (email) {
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
          existingEmailUser.githubId = githubUser.id.toString();
          existingEmailUser.avatar = githubUser.avatar_url;
          existingEmailUser.authProvider = "github";
          await existingEmailUser.save();
          user = existingEmailUser;
        }
      }
      if (!user) {
        let username = githubUser.login;
        const existingUsername = await User.findOne({ user: username });
        if (existingUsername) {
          username = `${githubUser.login}_${githubUser.id}`;
        }
        user = await User.create({
          user: username,
          name: githubUser.name || githubUser.login,
          email: email,
          github_handle: githubUser.login,
          githubId: githubUser.id.toString(),
          avatar: githubUser.avatar_url,
          authProvider: "github",
        });
      }
    }
    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard?login=success`,
    );
  } catch (error) {
    console.error("Github OAuth Error:", error.message);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=github_failed`,
    );
  }
};

module.exports.getMe = async (req, res) => {
    try{
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(404).json({success:false, message:"User not found"});
        }
        res.status(200).json({success:true, user});
    }
    catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
}
module.exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out' });
};