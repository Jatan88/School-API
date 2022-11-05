const express = require('express');
const app = express();
const auth = require('./middleware/auth') 
const User = require('./model/user') 
const Role = require('./middleware/role')
const Report = require('./model/report')


require("dotenv").config(); 
require("./config/database").connect(); 


const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const cookieParser = require('cookie-parser'); 



app.use(express.json()); 
app.use(cookieParser()); 

app.get('/', (req, res) => {
    res.send("Server Started.")
});

app.post("/register", async (req, res) => {
   try {
    const {name, email, password, number, role} = req.body;

    if(!(email && password && name)){
        res.status(400).send("All fields are required");
    }

    const existingUser = await User.findOne({email});

    if(existingUser){
        res.status(401).send("User is already registered");
    }

    const myEncPassword = await bcrypt.hash(password, 10)
    
    const user  = await User.create({
        name,
        email: email.toLowerCase(),
        password: myEncPassword,
        number,
        role,
    });

    const token = jwt.sign(
        {user_id: user._id, email},
        process.env.SECRET_KEY, 
        {
            expiresIn: "2h"
        }
    )
    user.token = token;

    user.password = undefined

    
    res.status(201).json(user)

   }catch(error) {
       console.log(error);
   }

});

app.post("/login", async(req, res) => {
    try{
        const {email, password, role} = req.body

        if(!(email && password && role)){
            res.status(400).send("Field is missing")
        }

        const user = await User.findOne({email})

        if(!user){
            res.status(400).send("You are not registered in our app")
        }

        if(user && (await bcrypt.compare(password, user.password))){
            const token = jwt.sign(
                {user_id: user._id, email},
                process.env.SECRET_KEY,
                {
                    expiresIn: "2h"
                }
            )
            user.token = token;
            user.password = undefined;
            // res.status(200).json(user)

            // if you want to use cookies
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.status(200).cookie('token', token, options).json(
                {
                    success: true,
                    token,
                    user
                }
            )
        }

    
        res.send(400).send("email or password is incorrect")

    }catch(error){
        console.log(error);
    }
});


app.post("/addreport", Role.roleAccess, async(req, res) => {
    try {
     const {name, fathername, semester, grades, role} = req.body;
   
     const report = await Report.create({
         name,
         fathername,
         semester,
         grades,
     });
 
     
     res.send("Report Created")
 
    }catch(error) {
        console.log(error);
    }
 
 });

 app.get("/getReport/:id", async (req, res) => {

    try{
        const { id: studentID} = req.params;
        const report = await Report.findOne({ id: studentID })
        res.status(200).json({report});

    }catch(error){
        console.log(error);
    }

 })



app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "cookies expired successfully",
    })
});

module.exports = app;