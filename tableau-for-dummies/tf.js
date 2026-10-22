/* Tableau site: screenshot figures with HTML fallback, lazy dataset loader */
(function(){
'use strict';
function initShots(){
  Array.prototype.forEach.call(document.querySelectorAll('figure.shot[data-shot]'), function(f){
    var id = f.getAttribute('data-shot'); var img = new Image(); img.alt = (f.querySelector('figcaption')||{}).textContent || id;
    img.onload = function(){ f.classList.add('has-img'); f.insertBefore(img, f.firstChild); };
    img.src = 'img/' + id + '.png';
  });
}
window.TF = { loadScoop: function(cb){ if (window.TF_SCOOP) return cb(window.TF_SCOOP); var s = document.createElement('script'); s.src = 'tf-scoop.js'; s.onload = function(){ cb(window.TF_SCOOP); }; document.head.appendChild(s); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initShots); else initShots();
})();
