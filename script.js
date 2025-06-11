// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Redirect to thankyou.html after successful submit
  // Get the newsletter form element
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      // Prevent default form submission
      e.preventDefault();

      // Submit the form data via AJAX
      fetch(this.action, {
        method: "POST",
        body: new FormData(this),
      })
        .then(function (response) {
          // Redirect regardless of response (or add success check)
          window.location.href = "thankyou.html";
        })
        .catch(function () {
          // Optionally handle errors here
          window.location.href = "thankyou.html";
        });
    });
  }

  // Get the close button element
  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.onclick = function (e) {
      e.preventDefault();
      window.close();
    };
  }
});
