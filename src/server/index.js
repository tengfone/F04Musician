const express = require('express');
const os = require('os');
const fileUpload = require('express-fileupload');
const cors = require('cors')

const app = express();

// middle ware
app.use(cors())
app.use(fileUpload());
app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

app.post('/api/upload', (req, res) => {

    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }

    const myFile = req.files.file;

    // Use the mv() method to place the file somewhere on your server
    // myFile.mv(`${__dirname}/public/${myFile.name}`, function (err) {
    myFile.mv(`./${myFile.name}`, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "error" });
        }

        // Run python Script

        // Return an array of midi + seconds etc etc
        return res.send({ file: myFile.name, path: `/${myFile.name}`, ty: myFile.type });
    });
})



app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
