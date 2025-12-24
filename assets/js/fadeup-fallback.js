// Hybrid fallback for fade-up animation on mobile
document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 600) {
    // After a short delay, check if .fade-up elements are still invisible
    setTimeout(function () {
      document.querySelectorAll('.fade-up').forEach(function (el) {
        if (!el.classList.contains('is-visible')) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }, 800); // Wait for animation JS to run first
  }
});