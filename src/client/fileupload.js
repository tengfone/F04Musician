import React, { useRef, useState } from 'react';
import axios from 'axios';

function FileUpload() {

    const [file, setFile] = useState('');
    const [data, getFile] = useState({ name: "", path: "" });
    const [progress, setProgess] = useState(0);
    const el = useRef();

    const handleChange = (e) => {
        setProgess(0)
        const file = e.target.files[0]
        console.log(file);
        setFile(file)
    }

    const uploadFile = () => {
        const formData = new FormData();
        formData.append('file', file)
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

    return (
        <div className="centered">
            <div>
                <input type="file" ref={el} onChange={handleChange} />
                <div className="progessBar" style={{ width: progress }}>{progress}</div>
                <button onClick={uploadFile} className="upbutton">Upload</button>
            </div>
            <hr />
            {data.path &&
                <div>
                    <textarea value={data.path} onChange={uploadFile} style ={{width: '100%',resize:"none"}} />
                    <p>Python Output: {data.py}</p>
                </div>}
        </div>
    );
}

export default FileUpload;
