const cache = {};

export default (d, s, id, jsSrc, cb) => {
  if (cache[id]) return cb(cache[id]);
  const element = d.getElementsByTagName(s)[0];
  const fjs = element;
  let js = element;
  js = d.createElement(s);
  js.id = id;
  js.type = "text/javascript";
  js.src = jsSrc;
  if (fjs && fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  } else {
    d.head.appendChild(js);
  }
  js.onload = function() {
    cb(js);
  };
  cache[id] = js;
};
