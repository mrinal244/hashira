import fs from "fs";

function absBig(n) { return n < 0n ? -n : n; }
function gcdBig(a, b) {
  for (a = absBig(a), b = absBig(b); b;) [a, b] = [b, a % b];
  return a;
}

class Rational {
  constructor(num, den = 1n) {
    if (den === 0n) throw new Error("zero denom");
    if (den < 0n) [num, den] = [-num, -den];
    let g = gcdBig(num, den);
    this.n = num / g;
    this.d = den / g;
  }
  add(q)    { return new Rational(this.n * q.d + q.n * this.d, this.d * q.d);}
  sub(q)    { return new Rational(this.n * q.d - q.n * this.d, this.d * q.d);}
  mul(q)    { return new Rational(this.n * q.n, this.d * q.d);}
  div(q)    { if(q.n===0n) throw "div 0"; let [n, d]=[this.n*q.d, this.d*q.n]; if(d<0n)[n, d]=[-n,-d]; return new Rational(n,d);}
  toString(){ return this.d === 1n ? this.n.toString() : `${this.n}/${this.d}`;}
  isWhole() { return this.d === 1n; }
}

function parseDigit(ch) {
  const c = ch.toLowerCase();
  if ("0" <= c && c <= "9") return c.charCodeAt(0) - 48;
  if ("a" <= c && c <= "z") return 10 + c.charCodeAt(0) - 97;
  throw new Error("bad digit " + ch);
}

function baseToBigInt(val, base) {
  let sum = 0n, B = BigInt(base);
  for (let ch of val) {
    let v = parseDigit(ch);
    if (v >= base) throw "bad digit";
    sum = sum * B + BigInt(v);
  }
  return sum;
}

function interpolateZero(ptArr) {
  let result = new Rational(0n, 1n);
  let size = ptArr.length;
  for (let i = 0; i < size; ++i) {
    let [xi, yi] = ptArr[i];
    let t = new Rational(yi, 1n);
    for (let j = 0; j < size; ++j) {
      if (j === i) continue;
      let [xj] = ptArr[j];
      t = t.mul(new Rational(-xj, xi - xj));
    }
    result = result.add(t);
  }
  return result;
}

(function () {
  const file = process.argv[2] || "input.json";
  let d = JSON.parse(fs.readFileSync(file, "utf-8"));
  let need = Number(d.keys.k);

  let arr = [];
  for (let i = 1; arr.length < need; ++i) {
    let key = String(i);
    if (d[key]) {
      let dec = baseToBigInt(d[key].value, Number(d[key].base));
      arr.push([BigInt(key), dec]);
    }
  }

  let ans = interpolateZero(arr);
  console.log(ans.isWhole() ? ans.n.toString() : ans.toString());
})();
