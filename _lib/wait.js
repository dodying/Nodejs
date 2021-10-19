const wait = function waitInMs(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

wait.ms = wait;
wait.s = (time) => wait(time * 1000);
wait.for = function waitFor(check, timeout) {
  return new Promise((resolve, reject) => {
    const start = new Date().getTime();
    let id;
    id = setInterval(async () => {
      if (new Date().getTime() - start >= timeout) {
        if (id) clearInterval(id);
        id = null;
        resolve(false);
        return;
      }
      let checked = false;
      try {
        checked = await check();
      } catch (error) {}
      if (checked) {
        if (id) clearInterval(id);
        id = null;
        resolve(true);
      }
    }, 200);
  });
};

module.exports = wait;
