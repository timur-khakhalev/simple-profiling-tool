const checkPoints = {}

const timeConverter = time => {
  if (time > 1000)
    return `${time / 1000} sec`
  else return `${time} ms`
}

module.exports = {
  start: event => {
    checkPoints[event] = {}
    checkPoints[event].start = {
      time: new Date().getTime()
    }
  },
  end: event => {
    checkPoints[event].end = {
      time: new Date().getTime()
    }
  },
  getReport: () => {
    const count = {
      time: 0
    }

    Object.keys(checkPoints).forEach(cp => {
      if (checkPoints[cp].end && checkPoints[cp].start) {
        const time = checkPoints[cp].end.time - checkPoints[cp].start.time

        checkPoints[cp] = {
          time: timeConverter(time)
        }

        count.time += time
      }
    })

    checkPoints.total = {
      time: timeConverter(count.time)
    }

    return checkPoints
  }
}
