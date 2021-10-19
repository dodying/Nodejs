// ==Headers==
// @Name:               tooltip
// @Description:        tooltip
// @Version:            1.0.9
// @Author:             dodying
// @Created:            2020-03-15 19:57:00
// @Modified:           2020-4-25 16:35:43
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==
/* global Mousetrap, $ */

let lastTooltip = null;

const main = function tooltip(option = {}, content) {
  Mousetrap.pause();
  if (lastTooltip) lastTooltip.close();
  if (typeof option === 'string') {
    option = { title: option };
    if (typeof content !== 'undefined') option.content = content;
  }
  if (option.theme === 'supervan' || option.autoClose === null || (option.autoClose && option.autoClose.split('|')[0] / 1000 > 1)) {

  } else {
    Mousetrap.unpause();
  }
  return new Promise((resolve, reject) => {
    lastTooltip = $.confirm({
      theme: 'banner',
      boxWidth: '50%',
      useBootstrap: false,
      title: null,
      autoClose: 'ok|0',
      backgroundDismiss: 'ok',
      buttons: {
        ok: {
          text: 'OK',
          btnClass: 'btn-blue',
          keys: ['enter'],
        },
      },
      onClose() {
        resolve();
        lastTooltip = null;
        Mousetrap.unpause();
      },
      onAction(btn) {
        resolve(btn);
        lastTooltip = null;
        Mousetrap.unpause();
      },
      ...option,
    });
  });
};
module.exports = main;
