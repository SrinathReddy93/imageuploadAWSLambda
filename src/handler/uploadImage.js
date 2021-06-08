'use strict';
const AWS = require("aws-sdk");
const formParser = require("./formParser")
var s3 = new AWS.S3();

const MAX_SIZE = 4000000 // 4MB
const bucket = "lambda-interview-tests"
const User = require("../../models/user.model");
const jwt = require('jsonwebtoken');

module.exports.uploadImageToS = async (event, context, callback) => {
  let authorization = event.headers['Authorization'];
  let verify = await verifyToken(authorization);
  if(!verify.success) {
    return {
        statusCode: 200,
        body: JSON.stringify(verify)
      }
  }
  let email = verify.email;
  const formData = await formParser.parser(event, MAX_SIZE)
  const file = formData.files[0]

  const uid = new Date().getTime();
  const originalKey = `${uid}_original_${file.filename}`
  const [originalFile] = await Promise.all([
      uploadToS3(bucket, originalKey, file.content, file.contentType)
  ])
  const signedOriginalUrl = s3.getSignedUrl("getObject", { Bucket: originalFile.Bucket, Key: originalKey, Expires: 60000 })

  try {
    await User.update({email},{imageUrl:signedOriginalUrl})
  } catch (err) {
      console.log('err image ', err);
  }

  callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            id: uid,
            mimeType: file.contentType,
            originalKey: originalFile.key,
            bucket: originalFile.Bucket,
            fileName: file.filename,
            originalUrl: signedOriginalUrl,
            originalSize: file.content.byteLength
        }),
        headers: {'Content-Type': 'application/json'}
    });
};

const verifyToken = (token) => {
    return new Promise(async(resolve, reject)=>{
        try {
            const decoded = await jwt.verify(token, "shhhhh", { ignoreExpiration: false });
            if (decoded == "undefined" || decoded === null) {
                return resolve({success:false, message:"Invalid token"});
            }
            let email = decoded.email;
            return resolve({success:true, email});
        } catch (err) {
            return resolve({success:false, message:"something went wrong.", err})
        }
    });
}

const uploadToS3 = (bucket, key, buffer, mimeType) =>
    new Promise((resolve, reject) => {
        s3.upload(
            { Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType },
            function(err, data) {
                if (err) reject(err);
                resolve(data)
            })
    })