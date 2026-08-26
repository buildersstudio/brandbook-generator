/* The shared Builders toolkit dock.
 *
 * CSS and markup are lifted verbatim from the LinkedIn Post Studio
 * (buildersstudio/linkedin-post-studio, studio/index.html) so every tool in the
 * toolkit carries the identical bar. Only two things are tool-specific: the
 * GitHub URL and the copy inside the "?" panel.
 *
 * Self-contained on purpose — drop this file plus toolkit/builders-logo.svg into
 * any tool and the dock appears.
 */
(function () {
  var GH = 'https://github.com/buildersstudio/brandbook-generator';

  var css = document.createElement('style');
  css.textContent = [
    '.dock { position:fixed; left:50%; bottom:16px; transform:translateX(-50%); z-index:30;',
    '        max-width:calc(100vw - 24px) }',
    /* never wrap: a wrapped pill keeps its 100px radius and reads as a blob, and the
       separator strands itself on a line of its own. Narrow screens drop the least
       useful element instead (see the media queries below). */
    '.dock-bar { display:flex; align-items:center; gap:16px; flex-wrap:nowrap; justify-content:center;',
    '        background:rgba(23,24,26,.92); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);',
    '        border:1px solid #2e3134; border-radius:100px; padding:9px 10px 9px 20px;',
    '        box-shadow:0 18px 50px rgba(0,0,0,.55) }',
    '.dock-brand { display:inline-flex; align-items:center; gap:10px; text-decoration:none;',
    '        color:#c7cace; font-size:12.5px; font-weight:600; transition:color .15s; white-space:nowrap }',
    '.dock-brand:hover { color:#fff }',
    '.dock-brand img { height:12px; display:block }',
    '.dock-brand .tag-short { display:none }',
    '.dock-sep { width:1px; height:22px; background:#2e3134; flex:none }',
    '.dock-gh { display:inline-flex; align-items:center; gap:9px; background:#fff; color:#0e0f10;',
    '        border-radius:100px; padding:11px 21px; font-size:13.5px; font-weight:700;',
    '        text-decoration:none; white-space:nowrap; transition:transform .15s }',
    '.dock-gh:hover { transform:translateY(-1px) }',
    '.dock-gh svg { display:block }',
    '.dock-gh .gh-short { display:none }',
    '.dock-how { display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px;',
    '        border-radius:50%; border:1px solid rgba(255,255,255,.16); background:none; color:rgba(255,255,255,.68);',
    '        font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; flex:none;',
    '        transition:color .15s, border-color .15s }',
    '.dock-how:hover, .dock-how.on { color:#fff; border-color:rgba(255,255,255,.42) }',
    '.dock-info { position:absolute; bottom:66px; right:0; width:min(430px, calc(100vw - 32px));',
    '        background:#17181a; border:1px solid #2e3134; border-radius:14px; padding:18px 20px 16px;',
    '        box-shadow:0 24px 60px rgba(0,0,0,.55); text-align:left;',
    '        max-height:calc(100vh - 100px); overflow-y:auto }',
    '.dock-info h3 { font-size:13.5px; font-weight:650; color:#fff; margin-bottom:6px }',
    '.dock-info p { font-size:12.5px; line-height:1.6; color:#9aa0a6; margin-bottom:12px }',
    '.dock-info p b { color:#c7cace; font-weight:600 }',
    '.dock-info .st { display:flex; gap:10px; align-items:flex-start; font-size:12.5px; line-height:1.55;',
    '        color:#c7cace; margin-bottom:10px }',
    '.dock-info .st span:first-child { flex:none; width:18px; height:18px; border-radius:50%; background:#26282b;',
    '        color:#9aa0a6; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center;',
    '        margin-top:1px }',
    '.dock-info .st i { font-style:normal; color:#9aa0a6 }',
    '.dock-info code { background:#0e0f10; border:1px solid #26282b; border-radius:5px; padding:1px 5px;',
    '        font-size:11px; color:#c7cace }',
    '.dock-info .dx { position:absolute; top:9px; right:10px; background:none; border:none; color:#6b7075;',
    '        font-size:16px; line-height:1; cursor:pointer; padding:2px 4px }',
    '.dock-info .dx:hover { color:#fff }',
    /* Each step down drops the least useful element rather than letting anything wrap. */
    '@media (max-width: 780px) {',
    '  .dock-bar { gap:13px; padding:9px 10px 9px 16px }',
    '  .dock-brand .tag-long { display:none }',
    '  .dock-brand .tag-short { display:inline }',
    '}',
    '@media (max-width: 600px) {',
    '  .dock-brand .tag-short { display:none }',   /* the logo alone keeps the link */
    '}',
    '@media (max-width: 500px) {',
    /* a full-width pill reads as a blob, so square it off into a bottom bar */
    '  .dock { left:10px; right:10px; transform:none; max-width:none }',
    '  .dock-bar { justify-content:space-between; border-radius:18px; gap:10px; padding:9px 10px }',
    '  .dock-sep { display:none }',
    '  .dock-gh { padding:11px 15px; font-size:13px }',
    '  .dock-gh .gh-long { display:none }',
    '  .dock-gh .gh-short { display:inline }',
    '  .dock-info { left:0; right:0; width:auto }',
    '}',
    '@media (max-width: 380px) {',
    '  .dock-bar { gap:8px; padding:8px 9px }',
    '  .dock-brand img { height:10px }',
    '  .dock-gh { padding:10px 13px; font-size:12.5px; gap:7px }',
    '  .dock-how { width:30px; height:30px; font-size:14px }',
    '}',
  ].join('\n');
  document.head.appendChild(css);

  var octocat = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
    + '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>';

  var dock = document.createElement('div');
  dock.className = 'dock';
  dock.innerHTML = ''
    + '<div class="dock-info" id="dockinfo" hidden>'
    +   '<button class="dx" id="dockx" title="Close">&times;</button>'
    +   '<h3>This brandbook is a free tool you can own</h3>'
    +   '<p>It is a plain folder of web pages: no accounts, no server, no install. Your brand'
    +      ' lives in one file on your computer, and only leaves it if you publish.</p>'
    +   '<div class="st"><span>1</span><span><b>Get your own copy.</b> On the GitHub page, click the'
    +      ' green <b>Code</b> button, then <b>Download ZIP</b> (or fork it if you use GitHub).'
    +      ' Unzip anywhere. <i>Full details in the README.</i></span></div>'
    +   '<div class="st"><span>2</span><span><b>Point it at your brand.</b> Open the folder in'
    +      ' <a href="https://claude.com/claude-code" target="_blank" rel="noopener" style="color:#c7cace">Claude Code</a>'
    +      ' and just ask: "my website is acme.example, build my brandbook". The included'
    +      ' <code>CLAUDE.md</code> teaches Claude how the tool works, so it extracts your logo,'
    +      ' colors, fonts and voice, writes them into <code>brand-book.json</code>, and renders'
    +      ' this book in your brand.</span></div>'
    +   '<div class="st"><span>3</span><span><b>Publish it, and the rest follows.</b> A published'
    +      ' brandbook is the source of truth the other free tools read — ask the Post Studio for'
    +      ' a post and it already knows your brand. <i>See <code>PUBLISH.md</code>.</i></span></div>'
    + '</div>'
    + '<div class="dock-bar">'
    +   '<a class="dock-brand" href="https://toolkit.builders.studio" target="_blank" rel="noopener" title="More free tools by Builders Studio">'
    +     '<img src="toolkit/builders-logo.svg" alt="Builders">'
    +     '<span class="tag-long">Check out other free tools →</span>'
    +     '<span class="tag-short">Free tools →</span>'
    +   '</a>'
    +   '<span class="dock-sep"></span>'
    +   '<a class="dock-gh" href="' + GH + '" target="_blank" rel="noopener">'
    +     octocat
    +     '<span class="gh-long">Clone this tool from GitHub</span>'
    +     '<span class="gh-short">Clone from GitHub</span>'
    +   '</a>'
    +   '<button class="dock-how" id="dockhow" title="How this works">?</button>'
    + '</div>';
  document.body.appendChild(dock);

  var b = document.getElementById('dockhow'), p = document.getElementById('dockinfo');
  function set(open) { p.hidden = !open; b.classList.toggle('on', open); }
  b.onclick = function (e) { e.stopPropagation(); set(p.hidden); };
  document.getElementById('dockx').onclick = function () { set(false); };
  document.addEventListener('click', function (e) {
    if (!p.hidden && !p.contains(e.target) && e.target !== b) set(false);
  });
})();
