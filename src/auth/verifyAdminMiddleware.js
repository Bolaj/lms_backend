const jwt = require("jsonwebtoken");
const User = require("./../models/user")
const mongoose = require("mongoose")

exports.verifyAdmin = async (req, res, next) =>{
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message: "No token provided"})
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if(!user || user.role !== "admin"){
            return res.status(401).json({message: "Unauthorized, user is not a admin"});
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}


exports.validateMongoId = (req, res, next) => {
    const id = req.params.id || req.body.id;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid MongoDB ID" });
    }
  
    next();
  };
  

exports.verifyUser = async (req, res, next) =>{
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message: "No token provided"})
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if(!user || user.role !== "admin" || user.role === "teacher"){
            return res.status(401).json({message: "Unauthorized, You can't create a course"});
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
