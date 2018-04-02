const Benchmark = require("benchmark");

const suite = new Benchmark.Suite();
const reduxTests = require("./redux");
const reduxContainerTest = require("./redux_container");
const reduxlessTests = require("./reduxless");
const reduxlessContainerTest = require("./reduxless_container");

// add tests
suite
  .add("redux-action", function() {
    reduxTests.actionTest();
  })
  .add("redux-action-and-selectors", function() {
    reduxTests.actionAndSelectorTest();
  })
  .add("redux-container", function() {
    reduxContainerTest.containerTest();
  })
  .add("reduxless-action", function() {
    reduxlessTests.actionTest();
  })
  .add("reduxless-action-and-selectors", function() {
    reduxlessTests.actionAndSelectorTest();
  })
  .add("reduxless-container", function() {
    reduxlessContainerTest.containerTest();
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
