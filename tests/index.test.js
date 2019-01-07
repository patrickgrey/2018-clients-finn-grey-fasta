import test from "ava";
// https://medium.com/allenhwkim/ava-the-test-tool-that-works-5d98ee03933e
// https://medium.freecodecamp.org/testing-your-nodejs-applications-with-ava-js-99e806a226a7

test("my passing test", t => {
  t.pass();
});

test.todo("will think about writing this later");
