const express = require('express');
const os = require('os');
const fileUpload = require('express-fileupload');
const cors = require('cors')
const app = express();

app.use(cors())
app.use(fileUpload());
app.use(express.static('dist'));

// kill $(lsof -t -i:8080)

app.post('/api/upload', (req, res) => {

    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }

    const myFile = req.files.file;
    const modelChoice = req.body.choice;
    const startW = req.body.startVal;
    const endW = req.body.endVal;
    const sigmoidVal = req.body.sigmoidVal;

    myFile.mv(`./uploads/${myFile.name}`, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "error" });
        }

        if (modelChoice === "CNN") {
            // CNN
            var spawn = require("child_process").spawn;
            var process = spawn('python3', ["./machine_learning/CNN_main.py",
                myFile.name]);
            process.stdout.on('data', (data) => {
                res.send({ file: myFile.name, path: `/${myFile.name}`, ty: myFile.type, py: data.toString() });
            })
        } else {
            // LSTM
            var params = [];
            params.push(myFile.name)
            params.push(startW)
            params.push(endW)
            params.push(sigmoidVal)
            var spawn = require("child_process").spawn;
            var process = spawn('python3', ["./machine_learning/LSTM_main.py",
                params]);
            process.stdout.on('data', (data) => {
                res.send({ file: myFile.name, path: `/${myFile.name}`, ty: myFile.type, py: data.toString() });
            })
        }
    });
})

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
