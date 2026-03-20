(function() {
  if (typeof window.IMAGES === 'undefined') return;
  var images = window.IMAGES;
  function getIndex() {
    var hash = (window.location.hash || '').slice(1);
    var i = images.findIndex(function(img) { return img.id === hash; });
    return i >= 0 ? i : 0;
  }
  function render() {
    var i = getIndex();
    var img = images[i];
    var container = document.getElementById('image-container');
    if (!container) return;
    var backHref = '#';
    var match = (typeof location !== 'undefined' && location.pathname) ? location.pathname.match(/\/([^/]+)\/view\.html$/i) : null;
    if (match) backHref = '/albums/' + match[1] + '.html';
    var prevHtml = i > 0 ? '<a href="#' + images[i - 1].id + '">← previous</a>' : '<span class="image-nav-placeholder"></span>';
    var nextHtml = i < images.length - 1 ? '<a href="#' + images[i + 1].id + '">next →</a>' : '<span class="image-nav-placeholder"></span>';
    var title = img.title || img.id;
    var html = '<div class="image-page-layout">' +
      '<div class="image-page-image"><figure><img src="' + img.src + '" alt="' + title + '"></figure></div>' +
      '<div class="image-page-sidebar">' +
        '<a href="' + backHref + '" class="image-nav-back">← back to album</a>' +
        '<div class="image-sidebar-bottom">' +
          '<p class="image-page-caption">' + title + '</p>' +
          '<nav class="image-nav image-nav-prev-next-wrap" aria-label="Image navigation">' +
            '<span class="image-nav-prev-next">' + prevHtml + nextHtml + '</span>' +
          '</nav>' +
        '</div>' +
      '</div>' +
    '</div>';
    container.innerHTML = html;
    if (window.ALBUM_TITLE) document.title = 'Thomas Blessley • ' + window.ALBUM_TITLE;
    scheduleNavStackCheck();
  }
  function checkNavStack() {
    var layout = document.querySelector('.image-page-layout');
    var prevNext = document.querySelector('.image-nav-prev-next');
    if (!layout || !prevNext) return;
    var lineHeight = 24;
    var stacked = prevNext.scrollHeight > lineHeight;
    var maxContentHeight = window.innerHeight - 80;
    var tooBig = layout.offsetHeight > maxContentHeight;
    layout.classList.toggle('image-page-layout--nav-stacked', stacked && tooBig);
  }
  function scheduleNavStackCheck() {
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        checkNavStack();
      });
    });
  }
  window.addEventListener('hashchange', render);
  window.addEventListener('resize', checkNavStack);
  if (!window.location.hash && images.length) window.location.hash = images[0].id;
  render();
})();
