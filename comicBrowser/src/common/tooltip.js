// ==Headers==
// @Name:               tooltip
// @Description:        tooltip
// @Version:            1.0.2
// @Author:             dodying
// @Created:            2020-03-15 19:57:00
// @Modified:           2020-3-15 20:00:44
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==
/* global Mousetrap, $ */

'use strict';

let lastTooltip = null;

const main = function tooltip (option, content) {
  Mousetrap.pause();
  if (lastTooltip) lastTooltip.close();
  if (typeof option === 'string') {
    option = { title: option };
    if (typeof content !== 'undefined') option.content = content;
  }
  return new Promise((resolve, reject) => {
    lastTooltip = $.confirm(Object.assign({
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
          keys: ['enter']
        }
      },
      onClose: function () {
        resolve();
        lastTooltip = null;
        Mousetrap.unpause();
      },
      onAction: function (btn) {
        resolve(btn);
        lastTooltip = null;
        Mousetrap.unpause();
      }
    }, option));
  });
};
module.exports = main;
