(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 保險：body 已經 overflow:hidden，這裡確保內容不會被裁掉而是縮到放得下 */
  var stage = document.querySelector(".stage");
  var head = stage.querySelector(".masthead");
  var mainEl = stage.querySelector("main");
  var foot = stage.querySelector(".promise");

  function contentHeight() {
    return head.offsetHeight + mainEl.scrollHeight + foot.offsetHeight;
  }

  function fit() {
    stage.style.setProperty("--fit", "1");
    for (var pass = 0; pass < 2; pass++) {
      var need = contentHeight();
      if (need <= window.innerHeight + 1) break;
      var k = Math.max(window.innerHeight / need, 0.62);
      stage.style.setProperty("--fit", k.toFixed(4));
    }
  }

  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener("load", fit);

  /* 環境光：整頁顏色跟著使用者正在考慮的課程走 */
  var paths = document.getElementById("paths");
  var neutral = "92,124,224";
  var current = neutral;

  function setAccent(rgb, strong) {
    current = rgb;
    var s = document.documentElement.style;
    s.setProperty("--accent", "rgb(" + rgb + ")");
    s.setProperty("--accent-soft", "rgba(" + rgb + "," + (strong ? ".24" : ".16") + ")");
  }

  Array.prototype.forEach.call(paths.querySelectorAll(".path"), function (el) {
    var on = function () { setAccent(el.dataset.accent, true); paths.classList.add("dimmed"); };
    var off = function () { setAccent(neutral, false); paths.classList.remove("dimmed"); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
  });

  /* 背景節點場：極淡，跟著游標呼吸 */
  var canvas = document.getElementById("field");
  if (reduced) { canvas.style.display = "none"; return; }

  var ctx = canvas.getContext("2d");
  var nodes = [], w = 0, h = 0;
  var pointer = { x: -9999, y: -9999 };

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.round(Math.min(64, Math.max(24, (w * h) / 26000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16
      });
    }
  }

  window.addEventListener("pointermove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; });
  window.addEventListener("pointerleave", function () { pointer.x = -9999; pointer.y = -9999; });
  window.addEventListener("resize", resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var rgb = current;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      var pd = Math.hypot(pointer.x - n.x, pointer.y - n.y);
      var lit = pd < 200 ? 1 - pd / 200 : 0;

      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.1 + lit * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + rgb + "," + (0.16 + lit * 0.5) + ")";
      ctx.fill();

      for (var j = i + 1; j < nodes.length; j++) {
        var m = nodes[j];
        var d = Math.hypot(m.x - n.x, m.y - n.y);
        if (d < 132) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = "rgba(" + rgb + "," + (1 - d / 132) * (0.09 + lit * 0.16) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  draw();
})();
