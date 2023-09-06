```
const profiler = require('simple-profiling-tool')

profiler.start('someEvent')
...
await someEventExecution()
...
profiler.end('someEvent')


const report = profiler.getReport()
console.log(report) 
```