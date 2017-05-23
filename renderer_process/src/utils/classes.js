/**
 * Trick to prevent an issue in Babel6 when extending some builtin classes
 * http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
 * @param {class} cls a builtin class
 * @return {function} the extended class
 */
export function ExtendableBuiltinGen(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }
  ExtendableBuiltin.prototype = Object.create(cls.prototype);
  Object.setPrototypeOf(ExtendableBuiltin, cls);

  return ExtendableBuiltin;
}
