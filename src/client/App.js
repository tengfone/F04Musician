import React, { Component } from 'react';
import './app.css';
import FileUpload from './fileupload';
import 'html-midi-player';

export default class App extends Component {
  render() {
    return (
      <div>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Sevillana&display=swap');
          </style>
        <a href="./"><h1 >F04 Piano Transcription</h1></a>

        <body>
          <FileUpload />
        </body>
        <div style={{ backgroundColor: "white", justifyContent: "center"}}>
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
