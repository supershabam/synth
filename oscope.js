window.Oscope = React.createClass({
  componentDidMount: function() {
    this.analyser = this.props.audioCtx.createAnalyser()
    this.props.source.connect(this.analyser)
    this.canvasCtx = this.getDOMNode().getContext("2d")
    this.drawing = true
    var self = this
    var draw = function() {
      if (!self.drawing) return
      if (self.analyser.frequencyBinCount) {
        if (!self.bufferLength) {
          console.log('created data array', self.bufferLength, self.analyser.frequencyBinCount)
          self.bufferLength = self.analyser.frequencyBinCount
          self.dataArray = new Uint8Array(self.bufferLength)

        }
        self.analyser.getByteTimeDomainData(self.dataArray)
        self.paint.call(self)
      }
      requestAnimationFrame(draw)
    }
    draw()
  },
  componentWillUnmount: function() {
    this.drawing = false
  },
  paint: function(timestamp) {
    //drawVisual = requestAnimationFrame(draw)
    var canvas = this.getDOMNode()
    var WIDTH = canvas.width
    var HEIGHT = canvas.height

    var analyser = this.analyser
    var canvasCtx = this.canvasCtx
    analyser.getByteTimeDomainData(this.dataArray)
    analyser.fftSize = 2048
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)
    canvasCtx.fillStyle = 'rgb(200, 200, 200)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)
    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)'
    canvasCtx.beginPath()
    var sliceWidth = WIDTH * 1.0 / this.bufferLength
    var x = 0
    for(var i = 0; i < this.bufferLength; i++) {
      var v = this.dataArray[i] / 128.0
      var y = v * HEIGHT/2
      if(i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }
      x += sliceWidth
    }
    canvasCtx.lineTo(canvas.width, canvas.height/2)
    canvasCtx.stroke()
  },
  render: function() {
    return <canvas></canvas>
  }
})
