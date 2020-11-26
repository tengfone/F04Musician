import React, { Component } from 'react';
import './app.css';
import FileUpload from './fileupload';
import 'html-midi-player';

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>F04 Piano Transcription</h1>
        {/* {username ? <h1>{`Hello ${username}`}</h1> : <h1>Loading.. please wait!</h1>} */}
        <body>
          <FileUpload />
        </body>
        <div style={{ backgroundColor: "white", justifyContent: "center" }}>
          <section id="section1">
            <midi-player
              src="../../transcribed/outputtest.midi"
              // src="https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2b12128/twinkle_twinkle.mid"
              sound-font="https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus" visualizer="#section1 midi-visualizer">
            </midi-player>
            <midi-visualizer
              type="piano-roll">
            </midi-visualizer>
          </section>
        </div>
      </div>
    );
  }
}
