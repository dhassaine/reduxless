let id = 0;

global.requestAnimationFrame = (fn) => {
  setImmediate(() => fn(performance.now()));
  return ++id;
};

global.cancelAnimationFrame = (rafId: any) => clearImmediate(rafId);
