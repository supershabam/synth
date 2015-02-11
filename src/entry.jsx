import Rx from 'rx'
import React from 'react'
import Oscope from './components/oscope.jsx'
import keyboard from './keyboard'

keyboard(Rx.Observable.fromEvent(document, 'keydown'), Rx.Observable.fromEvent(document, 'keyup')).subscribe(e=>
  console.log(e)
)

React.render(<Oscope source={window.gain} audioCtx={window.audioCtx} />, document.getElementById('oscope'))
