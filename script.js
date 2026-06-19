(function(){
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll-triggered panel pop-in ---------- */
  function observePanels(selector){
    var els = document.querySelectorAll(selector);
    if(!els.length) return;
    if(reduceMotion || !('IntersectionObserver' in window)){
      els.forEach(function(el){ el.classList.add('show'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          var el = entry.target;
          var idx = Array.prototype.indexOf.call(els, el);
          setTimeout(function(){ el.classList.add('show'); }, (idx % 6) * 90);
          io.unobserve(el);
        }
      });
    }, { threshold:.2 });
    els.forEach(function(el){ io.observe(el); });
  }
  observePanels('.origin-panel');
  observePanels('.power-card');

  /* ---------- Power level calculator ---------- */
  function setMeter(key, pct){
    pct = Math.max(0, Math.min(100, Math.round(pct)));
    var fill = document.querySelector('[data-fill="' + key + '"]');
    var label = document.querySelector('[data-pct="' + key + '"]');
    if(fill) fill.style.width = pct + '%';
    if(label) label.textContent = pct + '%';
  }
  var runLevels = document.getElementById('runLevels');
  if(runLevels){
    runLevels.addEventListener('click', function(){
      var input = document.getElementById('yearsInput');
      var years = parseFloat(input.value);
      if(isNaN(years) || years < 0) years = 0;
      setMeter('humor', 30 + years * 2.6);
      setMeter('patience', 20 + years * 3.0);
      setMeter('nav', 35 + years * 2.2);
      setMeter('strength', 45 + years * 1.5);
      setMeter('wisdom', 25 + years * 2.8);
    });
  }

  /* ---------- Catchphrase generator ---------- */
  var lines = [
    "I'm not lost. I'm exploring options at high speed.",
    "Ask your mother. She's the real superhero here.",
    "Back in my day, the Wi-Fi was called 'going outside.'",
    "I'm not sleeping, I'm recharging with my eyes closed.",
    "Money doesn't grow on trees. It grows in my wallet, briefly.",
    "I make the rules. Ask your mother for the actual rules.",
    "Why pay for a gym? I lift the grocery bags every week.",
    "I've got 99 problems, and most of them are the remote control.",
    "Did I tell you about the time...? Yes. Telling it again anyway.",
    "I'm not strict, I'm just following a manual that doesn't exist.",
    "I'm not arguing, I'm just explaining why I'm right.",
    "Home before dark. That's the whole rule."
  ];
  var lastLine = -1;
  var cpBtn = document.getElementById('cpBtn');
  if(cpBtn){
    cpBtn.addEventListener('click', function(){
      var bubble = document.getElementById('cpBubble');
      var idx;
      do { idx = Math.floor(Math.random() * lines.length); } while(idx === lastLine && lines.length > 1);
      lastLine = idx;
      bubble.textContent = lines[idx];
    });
  }

  /* ---------- Fan mail canvas ---------- */
  var PAPER = '#F7F1DE';
  var INK = '#16130F';
  var RED = '#E5392B';
  var BLUE = '#1C4F9C';
  var YELLOW = '#F6C53C';

  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    var words = text.split(/\s+/);
    var line = '';
    var lines = [];
    for(var n = 0; n < words.length; n++){
      var test = line + words[n] + ' ';
      if(ctx.measureText(test).width > maxWidth && line !== ''){
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = test;
      }
    }
    lines.push(line.trim());
    lines.forEach(function(l, i){ ctx.fillText(l, x, y + i * lineHeight); });
    return y + lines.length * lineHeight;
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR){
    var rot = Math.PI / 2 * 3;
    var step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for(var i = 0; i < spikes; i++){
      var x1 = cx + Math.cos(rot) * outerR;
      var y1 = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x1, y1);
      rot += step;
      var x2 = cx + Math.cos(rot) * innerR;
      var y2 = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x2, y2);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
  }

  function drawCard(name, message){
    var canvas = document.getElementById('cardCanvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0,0,W,H);

    // halftone dots
    ctx.fillStyle = 'rgba(28,79,156,0.10)';
    for(var yy = 10; yy < H; yy += 16){
      for(var xx = 10; xx < W; xx += 16){
        ctx.beginPath();
        ctx.arc(xx, yy, 1.6, 0, Math.PI*2);
        ctx.fill();
      }
    }

    // border
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.strokeRect(20,20,W-40,H-40);

    // masthead
    ctx.fillStyle = RED;
    ctx.fillRect(20,20,W-40,72);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.strokeRect(20,20,W-40,72);
    ctx.fillStyle = PAPER;
    ctx.font = '700 30px "Archivo Black", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FAN MAIL', 46, 68);
    ctx.textAlign = 'right';
    ctx.font = '700 15px "Archivo Black", sans-serif';
    ctx.fillText('VOL. I  \u00B7  NO. 06', W-46, 68);
    ctx.textAlign = 'left';

    // greeting
    var dadName = (name && name.trim()) ? name.trim() : 'Dad';
    ctx.fillStyle = INK;
    ctx.font = '700 40px "Archivo Black", sans-serif';
    ctx.fillText('Dear ' + dadName + ',', 56, 175);

    // message
    var msg = (message && message.trim()) ? message.trim() :
      "Thank you for the early mornings, the patient explanations, and the rides nobody else could give. You made it look easy. Happy Father's Day.";
    ctx.font = '400 24px "Inter", sans-serif';
    var afterY = wrapText(ctx, msg, 56, 225, W-112, 36);

    // signature
    var dateStr = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
    ctx.textAlign = 'right';
    ctx.font = '700 22px "Archivo Black", sans-serif';
    ctx.fillText('Your #1 Fan,', W-58, Math.max(afterY + 50, H-145));
    ctx.font = '400 15px "Inter", sans-serif';
    ctx.fillStyle = BLUE;
    ctx.fillText(dateStr, W-58, Math.max(afterY + 76, H-120));
    ctx.textAlign = 'left';

    // seal
    ctx.save();
    ctx.translate(150, H-108);
    ctx.rotate(-12 * Math.PI/180);
    ctx.fillStyle = YELLOW;
    drawStar(ctx, 0, 0, 12, 64, 50);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    drawStar(ctx, 0, 0, 12, 64, 50);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '700 13px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('APPROVED', 0, -6);
    ctx.fillText('BY THE', 0, 8);
    ctx.fillText('EDITOR', 0, 22);
    ctx.restore();

    // fine print
    ctx.fillStyle = INK;
    ctx.globalAlpha = .55;
    ctx.font = '400 13px "Inter", sans-serif';
    ctx.fillText('Issued ' + dateStr + ' \u00B7 Circulation: priceless.', 56, H-38);
    ctx.globalAlpha = 1;
  }

  var cardForm = document.getElementById('cardForm');
  if(cardForm){
    cardForm.addEventListener('submit', function(e){
      e.preventDefault();
      var draw = function(){
        drawCard(document.getElementById('dadName').value, document.getElementById('dadMsg').value);
      };
      if(document.fonts && document.fonts.ready){ document.fonts.ready.then(draw); }
      else { draw(); }
    });
  }

  var downloadBtn = document.getElementById('downloadBtn');
  if(downloadBtn){
    downloadBtn.addEventListener('click', function(){
      var canvas = document.getElementById('cardCanvas');
      var link = document.createElement('a');
      link.download = 'dad-fan-mail.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  /* ---------- Footer indicia date ---------- */
  var indicia = document.getElementById('indicia');
  if(indicia){
    var today = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
    indicia.textContent = 'This tribute published ' + today + '. No portion of this dad may be reproduced without his permission \u2014 which he will grant immediately, because he\u2019s proud of you.';
  }

  /* ---------- Init ---------- */
  function init(){
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(function(){ drawCard('', ''); });
    } else {
      drawCard('', '');
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
