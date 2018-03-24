const Benchmark = require("benchmark");

const suite = new Benchmark.Suite();
const reduxTests = require("./redux");
const reduxlessTests = require("./reduxless");

// add tests
suite
  .add("redux-action", function() {
    reduxTests.actionTest();
  })
  .add("redux-action-and-selectors", function() {
    reduxTests.actionAndSelectorTest();
  })
  .add("reduxless-action", function() {
    reduxlessTests.actionTest();
  })
  .add("reduxless-action-and-selectors", function() {
    reduxlessTests.actionAndSelectorTest();
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
