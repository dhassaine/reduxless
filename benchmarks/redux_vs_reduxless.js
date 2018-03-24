const Benchmark = require("benchmark");

const suite = new Benchmark.Suite();
const reduxTest = require("./redux");
const reduxlessTest = require("./reduxless");

// add tests
suite
  .add("redux", function() {
    reduxTest();
  })
  .add("reduxless", function() {
    reduxlessTest();
  })

  // add listeners
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run();
