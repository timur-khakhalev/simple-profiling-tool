```
const ProfilingTool = require('simple-profiling-tool')

const options = {
  nesting: true/false // With nesting you'll get report where events are sum by nesting levels. Just add level (number) as second argument to .start and .end methods
}

const profiler = new ProfilingTool(options)

profiler.start('someEvent', 0)
...
await someEventExecution()
...
profiler.end('someEvent', 0)


const report = profiler.getReport()
console.log(report) 
```