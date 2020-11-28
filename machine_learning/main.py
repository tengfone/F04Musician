import sys
import numpy as np
import os
from nnAudio import Spectrogram
import torch
from torch import nn
from scipy.io import wavfile
import operator
from midiutil import MIDIFile


device = "cpu"

class Model(torch.nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        # Getting Mel Spectrogram on the fly
        self.spec_layer = Spectrogram.MelSpectrogram(sr=44100, n_mels=192,hop_length=441,
                                            window='hann', center=True, pad_mode='reflect',
                                            fmin=20, fmax=4200, norm=1,
                                            trainable_mel=False, trainable_STFT=False).to(device)
        k_out = 8
        k2_out = 16
        self.CNN_freq_kernel_size = (64,1)
        self.CNN_freq_kernel_stride = (4,1)
        self.CNN_freq = nn.Conv2d(1,k_out,
                                kernel_size=self.CNN_freq_kernel_size,stride=self.CNN_freq_kernel_stride, padding=(2,0))
        self.CNN_time = nn.Conv2d(k_out,k2_out,
                                kernel_size=(1,6),stride=(1,1), padding=(0,2))
        self.linear = torch.nn.Linear(2992, 748, bias=False)
        self.linear2 = torch.nn.Linear(748, 88, bias=False)

    def forward(self,x):
        z = self.spec_layer(x)

        z = torch.log(z+1e-20)

        z2 = torch.relu(self.CNN_freq(z.unsqueeze(1)))

        z3 = torch.relu(torch.flatten(z2,1))
        z4 = self.linear(z3)
        y = self.linear2(z4)
        return torch.sigmoid(y)

# For now just takes in an argument and returns the argument (String)

def main(argv):
    file_name = ''.join(map(str, argv))
    file_path = "./uploads/" + file_name
    print(file_name)
    print(file_path)
    model = Model()
    checkpoint = torch.load('./machine_learning/model/model.pt', map_location = 'cpu')
    model.load_state_dict(checkpoint['state_dict'], strict=False)
    model.eval()

    pred = []

    sr, song = wavfile.read(file_path) # Loading your audio
    song = song/abs(max(song.min(), song.max(), key=abs))

    segs = len(song)//4410

    for j in range(segs-1): #lazy
        seg = song[j*4410:(j+1)*4410]
        x = seg.mean(1) # Converting Stereo to Mono
        x = torch.tensor(x, device=device, dtype=torch.float) # casting the array into a PyTorch Tensor
        y_pred = model(x)
        to_numpy = y_pred.cpu().detach().numpy()[0]
        pred.append(to_numpy)
    
    pred = np.round(np.array(pred))
    pred = pred.T

    # 88 is the 🎹 🔑  (21 to 108)
    predT = pred.T
    new_notes = []
    for i in predT:
        x = np.where(i!=0)[0]+21
        new_notes.append(x.tolist())
    
    degrees  = new_notes  # MIDI note number
    track    = 0
    channel  = 0
    time     = 0.1    # In beats
    duration = 1    # In beats
    tempo    = 60   # In BPM
    volume   = 100  # 0-127, as per the MIDI standard

    MyMIDI = MIDIFile(1)  # One track, defaults to format 1 (tempo track is created
                        # automatically)
    MyMIDI.addTempo(track, time, tempo)

    for i, pitches in enumerate(degrees):
        if pitches!=[]:
            for pitch in pitches:
                MyMIDI.addNote(track, channel, pitch, time*i, duration, volume)
    outputFile = file_name[:-3]

    with open("./transcribed/outputtest.midi".format(outputFile), "wb") as output_file:
        MyMIDI.writeFile(output_file)

    # with open("../transcribed/{}.midi".format(outputFile), "wb") as output_file:
    #     MyMIDI.writeFile(output_file)

    print(argv)

if __name__ == "__main__":
    main("test_coffin.wav")
    # main(sys.argv[1:])