'use strict'
const connectToDatabase = require('../../db');
const User = require("../../models/user.model");
const bcrypt = require('bcryptjs');

module.exports.createUser =  async (event, context, callback) => {
    if (event.body) {
        await connectToDatabase()
        const data = JSON.parse(event.body);
        const response = await saveUser(data)
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

const saveUser = (obj) => 
    new Promise(async (resolve, reject) => {
            try {
                let userPresent = await User.find({email:obj.email});
                console.log('userPresent ', userPresent);
                if(userPresent.length > 0) {
                    return resolve({success:false,
                        message:"User email is already present."})
                }
                let data = {};
                data.email = obj.email;
                const password = obj.password;
                const salt = bcrypt.genSaltSync(10);
                const passwordHash = bcrypt.hashSync(password, salt);
                data.password = passwordHash;
                await User.create(data);
                return resolve({success:true, message:"User registred successfully."})
            } catch (err) {
                return resolve({success:false, message:"User not registred successfully.", err})
            }
});