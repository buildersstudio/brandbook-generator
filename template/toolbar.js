/* Shared toolkit bar — 1:1 the floating toolbar from the LinkedIn post generator
   (social-media-assets-builder/workflow/lib/edit.js). Same cssText, same anatomy:
   a muted label, one green action, one subtle text button. All Builders toolkit
   tools mount this same bar. */
(function () {
  var bar = document.createElement('div');
  bar.id = 'edit-toolbar';
  bar.style.cssText =
    'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;' +
    'display:flex;align-items:center;gap:14px;background:rgba(20,22,26,.96);color:#fff;' +
    'font:600 14px/1 Inter,system-ui,sans-serif;padding:12px 16px;border-radius:12px;' +
    'box-shadow:0 12px 40px rgba(0,0,0,.5);-webkit-font-smoothing:antialiased;';
  bar.innerHTML =
    '<span style="opacity:.7;font-weight:500">✦ Brandbook Generator — free for founders</span>' +
    '<a id="gh-go" href="https://github.com/buildersstudio/brandbook-generator" target="_blank" rel="noopener" ' +
    'style="all:unset;cursor:pointer;background:#10ac52;color:#fff;' +
    'padding:9px 16px;border-radius:9px;font-weight:600">Get the tool ↗</a>' +
    '<button id="gh-cp" style="all:unset;cursor:pointer;opacity:.7;padding:9px 6px">copy git clone</button>';
  document.body.appendChild(bar);
  document.getElementById('gh-cp').onclick = function () {
    var b = this;
    navigator.clipboard.writeText('git clone https://github.com/buildersstudio/brandbook-generator.git');
    b.textContent = 'copied ✓';
    setTimeout(function () { b.textContent = 'copy git clone'; }, 1400);
  };
})();
