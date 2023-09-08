const checkPoints = {}

const timeConverter = time => {
  if (time > 1000)
    return `${time / 1000} sec`
  else return `${time} ms`
}

const addEventNum = (keys, field, status) => {
  if (field) {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
    const lastElement = keys
      .map(c => parseInt(c.replaceAll(/[^0-9]+/g, '')))
      .filter(i => i)
      .sort(collator.compare)
      .pop()
    if (status === 'end') return keys
      .sort(collator.compare)
      .pop()
    if (lastElement) field += lastElement + 1
    else field += 1
  }
  return field
}

module.exports = {
  start: event => {
    event = addEventNum(Object.keys(checkPoints), event, 'start')
    checkPoints[event] = {}

    Object.defineProperty(checkPoints, `${event}`, {
      value: {
        start: { }
      },
      writable: true
    })
    checkPoints[event].start = {
      time: new Date().getTime()
    }
  },
  end: event => {
    event = addEventNum(Object.keys(checkPoints), event, 'end')
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
