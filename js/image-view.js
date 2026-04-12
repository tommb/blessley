(function() {
  if (typeof window.IMAGES === 'undefined') return;
  var images = window.IMAGES;

  var CTX_SVG_LINK = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  var CTX_SVG_MAP = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }
  function renderContextBlock(ctx) {
    if (!ctx || (typeof ctx !== 'object')) return '';
    var body = ctx.body;
    var resources = ctx.resources;
    var hasBody = body && String(body).trim();
    var hasRes = resources && resources.length;
    if (!hasBody && !hasRes) return '';
    var parts = ['<aside class="image-page-context" aria-label="Context">'];
    if (hasBody) {
      parts.push('<div class="image-page-context__body">' + body + '</div>');
    }
    if (hasRes) {
      var resItems = [];
      for (var r = 0; r < resources.length; r++) {
        var res = resources[r];
        if (!res || !res.href) continue;
        var isMap = res.type === 'map';
        var iconSvg = isMap ? CTX_SVG_MAP : CTX_SVG_LINK;
        var label = res.label ? escapeHtml(res.label) : escapeHtml(res.href);
        var hrefEsc = escapeAttr(res.href);
        resItems.push(
          '<li><a class="image-page-context__resource" href="' + hrefEsc + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="image-page-context__icon">' + iconSvg + '</span>' +
          '<span class="image-page-context__resource-label">' + label + '</span></a></li>'
        );
      }
      if (resItems.length) {
        parts.push('<ul class="image-page-context__resources">');
        parts.push(resItems.join(''));
        parts.push('</ul>');
      }
    }
    parts.push('</aside>');
    if (parts.length <= 2) return '';
    return parts.join('');
  }

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
    var contextHtml = renderContextBlock(img.context);
    var html = '<div class="image-page-layout">' +
      '<div class="image-page-image"><figure><img src="' + img.src + '" alt="' + title + '"></figure></div>' +
      '<div class="image-page-sidebar">' +
        '<a href="' + backHref + '" class="image-nav-back">← back to album</a>' +
        '<div class="image-sidebar-bottom">' +
          '<div class="image-sidebar-bottom-scroll">' +
            '<p class="image-page-caption">' + title + '</p>' +
            contextHtml +
          '</div>' +
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
