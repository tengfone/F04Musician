import React, { useRef, useState } from 'react';
import axios from 'axios';

function FileUpload() {

    const [file, setFile] = useState('');
    const [data, getFile] = useState({ name: "", path: "" });
    const [progress, setProgess] = useState(0);
    const [value, defaultCheck] = useState("");

    const el = useRef();

    const handleChange = (e) => {
        setProgess(0)
        const file = e.target.files[0]
        console.log(file);
        setFile(file)
    }

    const uploadFile = () => {
        var whatModel = "CNN"
        if(value==="LSTM"){
            whatModel = "LSTM"
        }
        const formData = new FormData();
        formData.append('file', file)
        formData.append('choice',whatModel)
        axios.post('http://localhost:8080/api/upload', formData, {
            onUploadProgress: (ProgressEvent) => {
                let progress = Math.round(ProgressEvent.loaded / ProgressEvent.total * 100) + '%';
                setProgess(progress)
            }
        }).then(res => {
            console.log(res);
            getFile({ name: res.data.name, path: 'http://localhost:8080' + res.data.path, py: res.data.py })
            // el.current.value = "";
        }).catch(err => console.log(err))
    }

    const checkBox = (event) => {
        var value = event.target.value;
        defaultCheck(value)
    }

    return (
        <div className="centered">
            <div>
                <input className="mt-2" type="file" ref={el} onChange={handleChange} />
                <div className="progessBar mt-2" style={{ width: progress }}>{progress}</div>
                <button onClick={uploadFile} className="upbutton mt-2">Upload</button>
                <h5 className="pt-4">Choose Your Model</h5>
                <div className="form-check">
                    {/* here is the checkbox, i want to get the value */}
                    <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="CNN" checked onClick={(e) => checkBox(e)} />
                    <label className="form-check-label" htmlFor="exampleRadios1">
                        CNN
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="LSTM" onClick={(e) => checkBox(e)} />
                    <label className="form-check-label" htmlFor="exampleRadios2">
                        LSTM
                        </label>
                </div>
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
