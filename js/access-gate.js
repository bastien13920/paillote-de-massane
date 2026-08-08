/* ==========================================================================
   ACCESS GATE — protection temporaire par code d'accès avant lancement public.
   Pour rendre le site public : supprimer ce fichier et, dans chaque page HTML,
   retirer le bloc commenté "ACCESS GATE" (script inline + cette balise <script>).
   ========================================================================== */

(function () {
  var ACCESS_CODE = "110302";
  var STORAGE_KEY = "siteUnlocked";

  if (sessionStorage.getItem(STORAGE_KEY) === "true") {
    document.documentElement.style.display = "";
    return;
  }

  var overlay = document.createElement("div");
  overlay.className = "access-gate";
  overlay.innerHTML =
    '<div class="access-gate__box">' +
    '<img src="images/logo-mark.svg" alt="" class="access-gate__logo" width="52" height="52" />' +
    "<h1>LPM</h1>" +
    "<p>Site en cours de préparation, accès réservé.</p>" +
    '<form class="access-gate__form" id="access-gate-form">' +
    '<input type="password" inputmode="numeric" id="access-gate-input" placeholder="Code d\'accès" autocomplete="off" autofocus />' +
    '<button type="submit">Entrer</button>' +
    "</form>" +
    '<p class="access-gate__error" id="access-gate-error">Code incorrect, réessayez.</p>' +
    "</div>";

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(overlay);
    document.documentElement.style.display = "";

    var form = document.getElementById("access-gate-form");
    var input = document.getElementById("access-gate-input");
    var error = document.getElementById("access-gate-error");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value.trim() === ACCESS_CODE) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        overlay.remove();
      } else {
        error.classList.add("is-visible");
        input.value = "";
        input.focus();
      }
    });
  });
})();
