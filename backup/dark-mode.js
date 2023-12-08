document.addEventListener("DOMContentLoaded", function() {
  const toggleButton = document.getElementById("mode-toggle");  // Add this line

  toggleButton.addEventListener("click", function() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    
    if (currentTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });
});
