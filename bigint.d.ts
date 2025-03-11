declare global {
  interface BigInt {
      toJSON(): String;
  }
}

BigInt.prototype.toJSON = function () {
  return String(this);
};
