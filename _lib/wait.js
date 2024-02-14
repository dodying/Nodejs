const wait = function waitInMs(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

wait.ms = wait;
wait.s = (time) => wait(time * 1000);
wait.for = function waitFor(check, timeout = 0, interval = 200) {
  return new Promise((resolve, reject) => {
    const start = new Date().getTime();
    let id;
    id = setInterval(async () => {
      if (timeout && new Date().getTime() - start >= timeout) {
        if (id) clearInterval(id);
        id = null;
        resolve(false);
        return;
      }
      let checked = false;
      try {
        checked = await check();
      } catch (error) { /* noop */ }
      if (checked) {
        if (id) clearInterval(id);
        id = null;
        resolve(true);
      }
    }, interval);
  });
};

module.exports = wait;
