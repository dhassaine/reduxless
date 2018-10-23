const Benchmark = require("benchmark");
const reduxTests = require("./redux");
const reduxContainerTest = require("./redux_container");
const reduxlessTests = require("./reduxless");
const reduxlessContainerTest = require("./reduxless_container");
const reduxlessInfernoContainerTest = require("./reduxless_inferno_container");

// add tests
const suites = [];

suites.push(
  new Benchmark.Suite()
    .add("redux-action", function() {
      reduxTests.actionTest();
    })
    .add("reduxless-action", function() {
      reduxlessTests.actionTest();
    })
);

suites.push(
  new Benchmark.Suite()
    .add("redux-action-and-selectors", function() {
      reduxTests.actionAndSelectorTest();
    })
    .add("reduxless-action-and-selectors", function() {
      reduxlessTests.actionAndSelectorTest();
    })
);

suites.push(
  new Benchmark.Suite()
    .add("redux-container", function() {
      reduxContainerTest.containerTest();
    })
    .add("reduxless-container", function() {
      reduxlessContainerTest.containerTest();
    })
    .add("reduxless-inferno-container", function() {
      reduxlessInfernoContainerTest.containerTest();
    })
);

suites.forEach(suite =>
  suite
    .on("cycle", function(event) {
      console.log(String(event.target));
    })
    .on("complete", function() {
      console.log("Fastest is " + this.filter("fastest").map("name"));
    })
    .run()
);
