// Redirect to thankyou.html after successful submit
document
  .getElementById("newsletterForm")
  .addEventListener("submit", function (e) {
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

// Close the window when the button is clicked
document.getElementById("closeBtn").onclick = function (e) {
  e.preventDefault();
  window.close();
};
