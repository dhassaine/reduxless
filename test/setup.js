import chai from 'chai';
import preact from 'preact';
import assertJsx, { options } from 'preact-jsx-chai';
options.functions = false;
chai.use(assertJsx);

export const DEFAULT_DOCUMENT = '<!doctype html><html><head><meta charset="utf-8"/></head><body></body></html>';

// immediately render all changes
preact.options.debounceRendering = fn => fn();
global.requestAnimationFrame = setImmediate;
global.cancelAnimationFrame = clearImmediate;
global.preact = preact;
