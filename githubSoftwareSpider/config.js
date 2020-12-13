'use strict';

const data = {
  req: {
    proxy: 'http://127.0.0.1:8118',
    request: {
      headers: {
        Authorization: 'token xxx'
      },
      timeout: 60 * 1000
    },
    withProxy: [
      // 'github.com'
      // '/google/'
    ],
    autoProxy: true
  },
  thread: 10,
  repoFilter: (i) => {
    const hot = i.subscribers_count > 5 || i.stargazers_count > 20 || i.forks_count > 10;
    const hasDownloads = i.has_downloads;
    const isContinue = new Date().getTime() - new Date(i.updated_at).getTime() <= 1000 * 60 * 60 * 24 * 365 * (i.archived ? 3 : 5);
    const isFork = i.fork;
    const isUnlikeLanguage = [
      null,
      'HTML', 'CSS', 'PHP', 'Vue',
      'Swift', 'Objective-C', 'Objective-C++'
    ].includes(i.language);
    const descriptionExclude = [
      /([^A-Z]|\b)(Library|Plugin|framework|module|SDK|Software Development Kit)([^A-Z]|\b)/i,
      /([^A-Z]|\b)(macOS)([^A-Z]|\b)/i
    ].some(re => !i.description || i.description.match(re));
    return hot && hasDownloads && isContinue && !isFork && !isUnlikeLanguage && !descriptionExclude;
  },
  releaseFilter: (item, index) => {
    if (index > 5) return false;
    const { extname } = require('path');
    // const extname = (file) => '.' + file.split(/[\\/.]+/).slice(-1)[0];

    const hasAssets = item.assets.some(j => {
      const filter = [
        /([^A-Z]|\b)(win(dows)?|vc|mingw(64)?|cygwin|exe)([^A-Z]|\b)/i
      ].some(re => j.name.match(re));
      const sizeLarge = j.size > 1024 * 1024;
      const sizeSmall = j.size > 1024 * 10;

      const ext = ['.zip', '.7z'].includes(extname(j.name));
      const ext1 = ['.exe', '.msi', '.rar', '.jar', '.appx', '.appxbundle', '.msix', '.msixbundle'].includes(extname(j.name));
      const ext2 = ['.tar', '.gz', '.bz2', '.xz', '.nupkg'].includes(extname(j.name));

      const exclude = [
        /([^A-Z]|\b)(mac(os)?|app|osx|darwin|deb|ubuntu|linux|framework|demos?)([^A-Z]|\b)/i
      ].some(re => j.name.match(re));
      const downloadCount = j.download_count > 10;

      return !exclude && downloadCount && ((ext && sizeLarge) || ((ext || ext2) && filter && sizeSmall) || (ext1 && sizeSmall));
    });
    const lastUpdate = new Date().getTime() - new Date(item.published_at).getTime() <= 1000 * 60 * 60 * 24 * 365 * 5;

    return hasAssets && lastUpdate;
  }
};
module.exports = data;
