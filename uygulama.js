// Ana sayfadaki arama ve süzgeçler. Kartlar sayfada hazır gelir; burada yalnızca gizlenip gösterilir.
(function () {
  var ara = document.getElementById('ara');
  var sirket = document.getElementById('sirket');
  var cipler = document.querySelectorAll('.cip');
  var kartlar = document.querySelectorAll('#akis .kart');
  var sayac = document.getElementById('sayac');
  var bos = document.getElementById('bos');
  var sektor = '';

  var dil = document.documentElement.lang || 'tr';

  function kucuk(metin) {
    return metin.toLocaleLowerCase(dil);
  }

  function uygula() {
    var kelimeler = kucuk(ara.value).split(/\s+/).filter(Boolean);
    var gorunen = 0;
    kartlar.forEach(function (kart) {
      var uygun = (!sektor || kart.dataset.sektor === sektor) &&
        (!sirket.value || kart.dataset.sirket === sirket.value) &&
        kelimeler.every(function (k) { return kart.dataset.ara.indexOf(k) !== -1; });
      kart.hidden = !uygun;
      if (uygun) gorunen++;
    });
    sayac.textContent = sayac.dataset.kalip.replace('{n}', gorunen);
    bos.hidden = gorunen !== 0;
  }

  function sektorSec(deger) {
    sektor = deger;
    cipler.forEach(function (c) { c.classList.toggle('secili', c.dataset.sektor === deger); });
  }

  cipler.forEach(function (c) {
    c.addEventListener('click', function () { sektorSec(c.dataset.sektor); uygula(); });
  });
  ara.addEventListener('input', uygula);
  sirket.addEventListener('change', uygula);

  // Vaka sayfalarındaki sektör ve etiket bağlantıları ?sektor= ve ?ara= ile gelir.
  var p = new URLSearchParams(location.search);
  if (p.get('sektor')) sektorSec(p.get('sektor'));
  if (p.get('ara')) ara.value = p.get('ara');
  if (p.get('sirket')) sirket.value = p.get('sirket');
  uygula();
})();
