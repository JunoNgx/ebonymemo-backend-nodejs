const path = require('path')
const express = require('express')
const router = express.Router()
require("dotenv").config()
const Busboy = require('busboy')

const {Storage} = require('@google-cloud/storage')
const storage = new Storage({
    credentials: {
        "type": "service_account",
        "project_id": process.env.GC_PROJECT_ID,
        "private_key_id": process.env.GC_PRIVATE_KEY_ID,
        // Note: to use single quotes in the env file for this
        "private_key": JSON.parse(`"${process.env.GC_PRIVATE_KEY}"`),
        "client_email": process.env.GC_CLIEN_EMAIL,
        "client_id": process.env.GC_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": process.env.GC_SERVICE_ACCOUNT_KEY
      }
})

const bucket = storage.bucket(process.env.GC_BUCKET)

router.post('/', (req, res) => {

    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        const fileName = 'rymd.jpg'
        const image = bucket.file(fileName)

        file.pipe(image.createWriteStream({
            resumable: false,
            gzip: true,
            metadata: {
                contentType: 'image/jpeg',
            }
        }))
            .on('error', (err) => {})
            .on('finish', () => {
                console.log(`https://storage.googleapis.com/${process.env.GC_BUCKET}/${fileName}`)
                console.log('Upload completed.')
            })
    });
    req.pipe(busboy);
})


module.exports = router