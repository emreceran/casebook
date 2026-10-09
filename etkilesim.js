// 2. sürüm vaka sayfası: "Faydalı" düğmeleri, yorum formu ve çevrilmiş yorumlarda "aslını göster".
// Sunucu yok; her şey yalnızca bu tarayıcıda (localStorage) saklanır.
(function () {
  var vaka = document.querySelector('.vaka[data-vaka]');
  if (!vaka) return;
  var kimlik = vaka.dataset.vaka;
  var sayfaDili = document.documentElement.lang;
  var bolum = document.getElementById('yorumlar');
  var metin = JSON.parse(bolum.dataset.metin);
  var liste = document.getElementById('yorum-listesi');
  var form = document.getElementById('yorum-formu');
  var sayac = document.getElementById('yorum-sayisi');
  var hazirAdet = liste.children.length;

  function oku(anahtar, yoksa) {
    try {
      var ham = localStorage.getItem('casebook:' + anahtar);
      return ham ? JSON.parse(ham) : yoksa;
    } catch (hata) { return yoksa; }
  }
  function yaz(anahtar, deger) {
    try { localStorage.setItem('casebook:' + anahtar, JSON.stringify(deger)); } catch (hata) {}
  }

  // Çevrilmiş yorumlar: aslını göster / çeviriyi göster
  liste.querySelectorAll('.asil-dugme').forEach(function (dugme) {
    var yorum = dugme.closest('.yorum');
    var asilAcik = false;
    dugme.addEventListener('click', function () {
      asilAcik = !asilAcik;
      yorum.querySelectorAll('.cevrilen').forEach(function (p) {
        p.textContent = asilAcik ? p.dataset.asil : p.dataset.ceviri;
        p.lang = asilAcik ? 'tr' : sayfaDili;
      });
      dugme.textContent = asilAcik ? metin.cevirisini_goster : metin.aslini_goster;
    });
  });

  // Faydalı düğmeleri
  var begenilen = oku('begeni:' + kimlik, []);
  function begenCiz(dugme) {
    var secili = begenilen.indexOf(dugme.dataset.no) !== -1;
    dugme.setAttribute('aria-pressed', secili ? 'true' : 'false');
    dugme.querySelector('b').textContent = Number(dugme.dataset.sayi) + (secili ? 1 : 0);
  }
  liste.querySelectorAll('.begen').forEach(function (dugme) {
    begenCiz(dugme);
    dugme.addEventListener('click', function () {
      var i = begenilen.indexOf(dugme.dataset.no);
      if (i === -1) begenilen.push(dugme.dataset.no); else begenilen.splice(i, 1);
      yaz('begeni:' + kimlik, begenilen);
      begenCiz(dugme);
    });
  });

  // Kullanıcının kendi yorumları (hangi dilde yazıldıysa o dilde saklanır)
  var benimkiler = oku('yorum:' + kimlik, []);

  function el(etiket, sinif, yazi) {
    var d = document.createElement(etiket);
    if (sinif) d.className = sinif;
    if (yazi) d.textContent = yazi;
    return d;
  }
  function basHarfler(ad) {
    var p = ad.trim().split(/\s+/);
    return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toLocaleUpperCase(sayfaDili);
  }
  function benimkileriCiz() {
    liste.querySelectorAll('.benim').forEach(function (x) { x.remove(); });
    benimkiler.forEach(function (y, i) {
      var li = el('li', 'yorum benim');
      var ust = el('div', 'yorum-ust');
      ust.appendChild(el('span', 'avatar', basHarfler(y.ad)));
      var kim = el('div');
      kim.appendChild(el('strong', '', y.ad));
      kim.appendChild(el('span', 'soluk', y.unvan ? y.unvan + ' · ' + metin.senin_yorumun : metin.senin_yorumun));
      ust.appendChild(kim);
      li.appendChild(ust);
      var p = el('p', '', y.metin);
      if (y.dil) p.lang = y.dil;
      li.appendChild(p);
      var sil = el('button', 'sil', metin.sil);
      sil.type = 'button';
      sil.addEventListener('click', function () {
        benimkiler.splice(i, 1);
        yaz('yorum:' + kimlik, benimkiler);
        benimkileriCiz();
      });
      li.appendChild(sil);
      // Başka dilde yazılmış yorum: canlı çeviri sunucu gerektirir, şimdilik yalnızca belirtilir.
      if (y.dil && y.dil !== sayfaDili) {
        li.appendChild(el('div', 'ceviri-notu', metin.yazildi.replace('{dil}', metin.diller[y.dil] || y.dil)));
      }
      liste.appendChild(li);
    });
    sayac.textContent = hazirAdet + benimkiler.length;
  }

  form.addEventListener('submit', function (olay) {
    olay.preventDefault();
    var ad = form.ad.value.trim();
    var yazi = form.metin.value.trim();
    if (!ad || !yazi) return;
    benimkiler.push({ ad: ad, unvan: form.unvan.value.trim(), metin: yazi, dil: sayfaDili });
    yaz('yorum:' + kimlik, benimkiler);
    yaz('ad', { ad: ad, unvan: form.unvan.value.trim() });
    form.metin.value = '';
    benimkileriCiz();
    liste.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Adı ve unvanı sonraki vakalarda hatırla
  var kisi = oku('ad', null);
  if (kisi) { form.ad.value = kisi.ad || ''; form.unvan.value = kisi.unvan || ''; }
  benimkileriCiz();
})();
