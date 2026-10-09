// Dil seçici: seçilen dildeki aynı sayfaya gider ve tercihi hatırlar (site kökü buna göre yönlendirir).
(function () {
  var secici = document.getElementById('dil-sec');
  if (!secici) return;
  try { localStorage.setItem('casebook:dil', document.documentElement.lang); } catch (hata) {}
  secici.addEventListener('change', function () {
    var secenek = secici.options[secici.selectedIndex];
    try { localStorage.setItem('casebook:dil', secenek.dataset.dil); } catch (hata) {}
    location.href = secenek.value + location.search + location.hash;
  });
})();
