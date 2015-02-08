// variables
var leftchannel = []
var rightchannel = []
var recordingLength = 0
var sampleRate = 44100
var recording = false
var bufferSize = 2048
var recorder = window.audioCtx.createScriptProcessor(bufferSize, 2, 2)
var fakeGain = window.audioCtx.createGain()
fakeGain.gain.value = 0
window.gain.connect(recorder)
recorder.connect(fakeGain)
fakeGain.connect(window.audioCtx.destination) // audio processor doesn't seem to work unless it's connected to a destination
recorder.onaudioprocess = function(e){
  if (!recording) return
  var left = e.inputBuffer.getChannelData(0)
  var right = e.inputBuffer.getChannelData(1)
  // TODO can we avoid new?
  leftchannel.push(new Float32Array (left))
  rightchannel.push(new Float32Array (right))
  recordingLength += bufferSize
}

Rx.Observable.fromEvent(document, 'keydown')
  .filter(function(e) {
    return e.keyCode == 82 // r
  })
  .subscribe(function() {
    // http://typedarray.org/wp-content/projects/WebAudioRecorder/
    recording = !recording
    if (!recording) {
      // we flat the left and right channels down
      var leftBuffer = mergeBuffers ( leftchannel, recordingLength );
      var rightBuffer = mergeBuffers ( rightchannel, recordingLength );
      // we interleave both channels together
      var interleaved = interleave ( leftBuffer, rightBuffer );

      // we create our wav file
      var buffer = new ArrayBuffer(44 + interleaved.length * 2);
      var view = new DataView(buffer);

      // RIFF chunk descriptor
      writeUTFBytes(view, 0, 'RIFF');
      view.setUint32(4, 44 + interleaved.length * 2, true);
      writeUTFBytes(view, 8, 'WAVE');
      // FMT sub-chunk
      writeUTFBytes(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      // stereo (2 channels)
      view.setUint16(22, 2, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 4, true);
      view.setUint16(32, 4, true);
      view.setUint16(34, 16, true);
      // data sub-chunk
      writeUTFBytes(view, 36, 'data');
      view.setUint32(40, interleaved.length * 2, true);

      // write the PCM samples
      var lng = interleaved.length;
      var index = 44;
      var volume = 1;
      for (var i = 0; i < lng; i++){
          view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
          index += 2;
      }

      // our final binary blob
      var blob = new Blob ( [ view ], { type : 'audio/wav' } );

      // let's save it locally
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var link = window.document.createElement('a');
      link.href = url;
      link.download = 'output.wav';
      var click = document.createEvent("Event");
      click.initEvent("click", true, true);
      link.dispatchEvent(click);
    }
  })

function interleave(leftChannel, rightChannel){
  var length = leftChannel.length + rightChannel.length;
  var result = new Float32Array(length);

  var inputIndex = 0;

  for (var index = 0; index < length; ){
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }
  return result;
}

function mergeBuffers(channelBuffer, recordingLength){
  var result = new Float32Array(recordingLength);
  var offset = 0;
  var lng = channelBuffer.length;
  for (var i = 0; i < lng; i++){
    var buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function writeUTFBytes(view, offset, string){
  var lng = string.length;
  for (var i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
