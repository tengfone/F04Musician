import React, { useRef, useState } from 'react';
import axios from 'axios';

function FileUpload() {

    const [file, setFile] = useState('');
    const [data, getFile] = useState({ name: "", path: "" });
    const [progress, setProgress] = useState(0);
    const [value, defaultCheck] = useState("");
    const [startW, defaultstartW] = useState("");
    const [endW, defaultendW] = useState("");
    const [sigmoidValue, defaultsigmoid] = useState("");

    const el = useRef();

    const handleChange = (e) => {
        setProgress(0)
        const file = e.target.files[0]
        console.log(file);
        setFile(file)
    }

    const uploadFile = () => {
        var whatModel = "CNN"
        //startW is useState, startVal local
        var startVal, endVal, sigmoidVal;
        console.log(startW, endW, sigmoidValue);
        if (value === "LSTM") {
            if (startW === "") {
                startVal = "1"
            } else {
                startVal = startW
            }
            if (endW === "") {
                endVal = "40"
            } else {
                endVal = endW
            }
            if (sigmoidValue === "") {
                sigmoidVal = "0.9"
            } else {
                sigmoidVal = sigmoidValue
            }
            whatModel = "LSTM"
        }
        const formData = new FormData();
        formData.append('file', file)
        formData.append('choice', whatModel)
        formData.append('startVal', startVal)
        formData.append('endVal', endVal)
        formData.append('sigmoidVal', sigmoidVal)
        console.log(whatModel)
        axios.post('http://0.0.0.0:8080/api/upload', formData, {
            onUploadProgress: (ProgressEvent) => {
                let progress = Math.round(ProgressEvent.loaded / ProgressEvent.total * 100) + '%';
                setProgress(progress)
            }
        }).then(res => {
            console.log(res);
            getFile({ name: res.data.name, path: 'http://0.0.0.0:8080' + res.data.path, py: res.data.py })
        }).catch(err => console.log(err))
    }

    const checkBox = (event) => {
        var value = event.target.value;
        defaultCheck(value)
    }

    const startBox = (event) => {
        var startW = event.target.value;
        defaultstartW(startW)
    }

    const endBox = (event) => {
        var endW = event.target.value;
        defaultendW(endW)
    }

    const sigBox = (event) => {
        var sigmoidValue = event.target.value;
        defaultsigmoid(sigmoidValue)
    }

    return (
        <div className="centered">
            <div>
                <input className="mt-2" type="file" ref={el} onChange={handleChange} />
                <div className="progessBar mt-2" style={{ width: progress }}>{progress}</div>
                <button onClick={uploadFile} className="upbutton mt-2">Upload</button>
                <h5 className="pt-4">Choose Your Model</h5>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="CNN" defaultChecked onClick={(e) => checkBox(e)} />
                    <label className="form-check-label" htmlFor="exampleRadios1">
                        CNN
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="LSTM" onClick={(e) => checkBox(e)} />
                    <label className="form-check-label" htmlFor="exampleRadios2">
                        CNN + LSTM
                        </label>
                </div>
                <h6 className="pt-4">Select Parameters: (For LSTM Only)</h6>
                <form>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput">Start Window (int)</label>
                        <input type="text" className="form-control" id="formGroupExampleInput" placeholder="Default: 1" onChange={(e) => startBox(e)}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput2">End Window (int)</label>
                        <input type="text" className="form-control" id="formGroupExampleInput2" placeholder="Default: 40" onChange={(e) => endBox(e)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput2">Sigmoid Probability (float)</label>
                        <input type="text" className="form-control" id="formGroupExampleInput2" placeholder="Default: 0.9" onChange={(e) => sigBox(e)} />
                    </div>
                </form>
            </div>
            <hr />
            {data.path &&
                <div>
                    <textarea value={data.path} onChange={uploadFile} style={{ width: '100%', resize: "none" }} />
                    <p>Python Output: {data.py}</p>
                    <button type="button" className="btn btn-primary" onClick={() => window.location.reload(false)}>Let's Listen!</button>
                </div>}
        </div>
    );
}

export default FileUpload;
