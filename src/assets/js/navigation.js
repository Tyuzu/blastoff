
document.addEventListener("DOMContentLoaded", () => {

  // Mobile navigation
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");

  if (menuToggle && primaryNav) {

    menuToggle.addEventListener("click", () => {

      const isOpen = primaryNav.classList.toggle("is-open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

    });

  }

  // Dropdown navigation
  document.querySelectorAll(".dropdown-toggle").forEach(button => {

    button.addEventListener("click", event => {

      event.preventDefault();

      const parent = button.closest(".nav-item");

      const isOpen = parent.classList.toggle("dropdown-open");

      button.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    });

  });

});
