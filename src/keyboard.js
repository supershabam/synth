import MIDIKey from "./midikey"
import Rx from 'rx'

let defaultKeyMap = {
  "65": 60,
  "87": 61,
  "83": 62,
  "69": 63,
  "68": 64,
  "70": 65,
  "84": 66,
  "71": 67,
  "89": 68,
  "72": 69,
  "85": 70,
  "74": 71,
  "75": 72,
  "79": 73,
  "76": 74
}

export default function keyboard(keydowns, keyups, keyMap=defaultKeyMap) {
  var activeKeys = {}
  var octave = 0

  return Rx.Observable.merge(
    keydowns
      .filter(function(e) {
        return e.keyCode == 90 || e.keyCode == 88
      }) // octaves merged in even though it will never contribute to stream so that it is unsubscribed correctly
      .do(function(e) {
        if (e.keyCode == 90) {
          octave--
          return
        }
        octave++
        return
      })
      .flatMap(function() {
        return []
      }),
    keydowns
      .filter(function(e) {
        return e.keyCode in keyMap
      })
      .filter(function(e) {
        return !(e.keyCode in activeKeys)
      })
      .do(function(downEvent) {
        activeKeys[downEvent.keyCode] = true
      })
      .flatMap(function(downEvent) {
        var midiNote = keyMap[downEvent.keyCode]+(octave*12)
        return Rx.Observable.merge(
          Rx.Observable.of(new MIDIKey(midiNote, 100)),
          keyups
            .filter(function(upEvent) {
              return upEvent.keyCode == downEvent.keyCode
            })
            .do(function() {
              delete activeKeys[downEvent.keyCode]
            })
            .map(function() {
              return new MIDIKey(midiNote, 0)
            })
            .take(1)
        )
      })
    )
}
