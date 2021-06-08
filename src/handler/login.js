'use strict'
const connectToDatabase = require('../../db');
const User = require("../../models/user.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.loginUser =  async (event, context, callback) => {
    if (event.body) {
        console.log('loginUser ')
        await connectToDatabase()
        const data = JSON.parse(event.body);
        console.log('data ', data);
        const response = await checkUser(data)
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: {'Content-Type': 'application/json'}
        });
    } else {
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({sucess:false}),
            headers: {'Content-Type': 'application/json'}
        });
    }
}

const checkUser = (obj) => 
    new Promise(async (resolve, reject) => {
            try {
                console.log('obj.password ', obj.password);
                console.log('obj.email ', obj.email);
                let userPresent = await User.find({email:obj.email});
                console.log('userPresent ', userPresent);
                if(userPresent.length > 0) {
                    let password = await bcrypt.compareSync(obj.password, userPresent[0].password);
                    if(password) {
                        var token = jwt.sign({ email: obj.email }, 'shhhhh');
                        console.log('token ', token);
                        return resolve({success:true, token});
                    } else {
                        return resolve({success:false, message:"Please check your email and password."})
                    }
                } else {
                    return resolve({success:false, message:"Please check your email and password."})
                }
            } catch (err) {
                return resolve({success:false, message:"User not registred successfully.", err})
            }
});