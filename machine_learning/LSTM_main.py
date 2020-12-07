import sys
import numpy as np
import os
from nnAudio import Spectrogram
import torch
from torch import nn
from scipy.io import wavfile
from midiutil import MIDIFile
import operator

device = "cpu"

class Model(torch.nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        self.spec_layer = Spectrogram.MelSpectrogram(sr=44100, n_mels=156,hop_length=441,
                                            window='hann', center=True, pad_mode='constant',
                                            fmin=20, fmax=4200, norm=1,
                                            trainable_mel=False, trainable_STFT=False).to(device)
        k_out = 64
        self.CNN_freq_kernel_size = (64,1)
        self.CNN_freq_kernel_stride = (2,1)
        self.CNN_freq = nn.Conv2d(1,k_out,
                                kernel_size=self.CNN_freq_kernel_size,stride=self.CNN_freq_kernel_stride)
        self.lstm = torch.nn.LSTM(input_size=3008, hidden_size=1024, bias=False, dropout=0.2, batch_first=True)
        self.linear = torch.nn.Linear(1024, 88, bias=False)


    def forward(self,x):
        z = self.spec_layer(x)[:,:,:-1]
        z2 = torch.log(z+1e-30)
        z3 = torch.relu(self.CNN_freq(z2.unsqueeze(1)))
        z3 = z3.contiguous().view(z3.shape[0],z3.shape[1]*z3.shape[2],z3.shape[3])
        z3 = torch.transpose(z3, 1, 2)
        z4,states = self.lstm(z3)
        y = self.linear(z4)
        return torch.sigmoid(y)

def main(argv):
    argv = argv[0].split(",")
    sigmoidVal = float(argv[3])
    windStart = int(argv[1])
    windEnd = int(argv[2])
    file_name = ''.join(map(str, argv[0]))
    file_path = "./uploads/" + file_name
    print(file_name)
    print(file_path)
    model = Model()
    checkpoint = torch.load('./machine_learning/model/LSTM_model.pt', map_location = 'cpu')
    model.load_state_dict(checkpoint['state_dict'], strict=False)
    model.eval()

    preds = []

    sr, song = wavfile.read(file_path) # Loading your audio
    song = song/abs(max(song.min(), song.max(), key=abs))
    same_segs = len(song)//441

    for window in range(windStart,windEnd):
        pred = np.zeros(88)
        segs = len(song)//(441*window)
        seg = song[:(len(song)//(441*window))*(441*window)]
        x = seg.mean(1) # Converting Stereo to Mono
        x = torch.tensor(x, device=device, dtype=torch.float) # casting the array into a PyTorch Tensor
        x = x.contiguous().view(len(seg)//(441*window), 441*window)
        y_pred = model(x)
        to_numpy = y_pred.cpu().detach().numpy()
        for i in range(len(to_numpy)):
            pred=np.vstack((pred,to_numpy[i]))
        pred = pred[1:]
        pred = np.vstack((pred, np.zeros((same_segs-segs*window,88))))
        preds.append(pred)

    preds = np.array(preds)
    pred = np.amax(preds, axis=0)
    pred[pred < sigmoidVal] = 0

    # 88 is the 🎹 🔑  (21 to 108)
    new_notes = []
    for i in pred:
        x = np.where(i!=0)[0]
        #done
        x2 = x+21
        time = {}
        for j in range(len(x)):
            time[x2[j]]=round(i[x[j]],5)
        new_notes.append(time)

    degrees  = new_notes  # MIDI note number
    track    = 0
    channel  = 0
    time     = 0.01    # In beats
    duration = 1    # In beats
    tempo    = 60   # In BPM
    volume   = 127  # 0-127, as per the MIDI standard

    MyMIDI = MIDIFile(1)  # One track, defaults to format 1 (tempo track is created
                        # automatically)
    MyMIDI.addTempo(track, time, tempo)

    for i, pitches in enumerate(degrees):
        if degrees[i]!={}:
            for pitch in pitches:
                checkFirst = pitch not in degrees[i-1]
                if checkFirst:
                    MyMIDI.addNote(track, channel, pitch, time*i, duration, volume)

    with open("./transcribed/outputtest.midi", "wb") as output_file:
        MyMIDI.writeFile(output_file)

    print(argv)

if __name__ == "__main__":
    # templst = ["/Users/tengfone/Desktop/F04Musician/uploads/test_coffin.wav","1","40","0.9"]
    # main(templst)
    main(sys.argv[1:])