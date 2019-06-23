const cache = {};

export default (d, s, id, jsSrc) => {
  return new Promise((resolve, reject) => {
    if (cache[id]) return resolve(cache[id]);
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
      resolve(js);
    };
    cache[id] = js;
  });
};
