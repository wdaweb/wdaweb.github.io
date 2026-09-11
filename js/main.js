/* ===== 泰山職訓網頁設計 — 入口頁互動 ===== */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 載入時的一次接縫掃描：從中線向兩側揭開版面 */
  function playSweep() {
    if (reduced) return;
    var sweep = document.createElement('div');
    sweep.className = 'sweep';
    document.body.appendChild(sweep);
    sweep.addEventListener('animationend', function () {
      sweep.remove();
    });
  }

  /* 920 小時的數字滾動 */
  function countUp(el) {
    var target = parseInt(el.dataset.countTo, 10);
    if (!target || reduced) return;
    var start = performance.now();
    var duration = 1100;

    (function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* 底部標語輪播 */
  function rotateSlogans(el) {
    var lines = [
      '網頁設計從零開始　毫無基礎也能上手',
      '政府自辦訓練課程　待業民眾完全免費',
      '轉職網頁開發人員　掌握就業必備職能',
      '由淺入深學習技術　強化職場的競爭力'
    ];
    var i = 0;

    setInterval(function () {
      el.classList.add('is-out');
      setTimeout(function () {
        i = (i + 1) % lines.length;
        el.textContent = lines[i];
        el.classList.remove('is-out');
      }, reduced ? 0 : 450);
    }, 4200);
  }

  /* 滑入或聚焦哪一班，就把上下列換成該班的顏色 */
  function bindPaneAccent() {
    document.querySelectorAll('.pane').forEach(function (pane) {
      var key = pane.classList.contains('pane--front') ? 'front' : 'back';

      function on()  { document.body.dataset.active = key; }
      function off() { delete document.body.dataset.active; }

      pane.addEventListener('mouseenter', on);
      pane.addEventListener('mouseleave', off);
      pane.addEventListener('focus', on);
      pane.addEventListener('blur', off);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    playSweep();

    var num = document.querySelector('.facts__num');
    if (num) countUp(num);

    var slogan = document.getElementById('slogan');
    if (slogan) rotateSlogans(slogan);

    bindPaneAccent();
  });
})();
