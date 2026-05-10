document.addEventListener("DOMContentLoaded", function () {
  let darkModeButton = document.getElementById("darkModeToggle");

  // If the user previously turned dark mode on, keep it on after refresh.
  if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark-mode");

    if (darkModeButton) {
      darkModeButton.innerText = "Light Mode";
    }
  }

  // If the button exists on the page, make it switch dark mode on/off.
  if (darkModeButton) {
    darkModeButton.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");

      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "on");
        darkModeButton.innerText = "Light Mode";
      } else {
        localStorage.setItem("darkMode", "off");
        darkModeButton.innerText = "Dark Mode";
      }
    });
  }

  let forms = document.querySelectorAll(
    '#adminEditLookupForm, #adminEditSubmitForm, #adminDeleteLookupForm, #adminDeleteConfirmForm, form[action="/admin/add"]',
  );

  for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener("submit", function (event) {
      let errorMessages = [];

      let binInput = forms[i].querySelector('input[name="BIN"]');
      let originalBinInput = forms[i].querySelector('input[name="originalBIN"]');
      let addressInput = forms[i].querySelector('input[name="Address"]');
      let avgRatingInput = forms[i].querySelector('input[name="AvgRating"]');
      let reviewsCountInput = forms[i].querySelector('input[name="ReviewsCount"]');

      if (binInput) {
        let binNumber = Number(binInput.value.trim());

        if (
          binInput.value.trim().length === 0 ||
          isNaN(binNumber) ||
          binNumber <= 0 ||
          !Number.isInteger(binNumber)
        ) {
          errorMessages.push("BIN number must be a positive whole number.");
        }
      }

      if (originalBinInput) {
        let originalBIN = Number(originalBinInput.value.trim());

        if (
          originalBinInput.value.trim().length === 0 ||
          isNaN(originalBIN) ||
          originalBIN <= 0 ||
          !Number.isInteger(originalBIN)
        ) {
          errorMessages.push("Original BIN must be a positive whole number.");
        }
      }

      if (addressInput) {
        let address = addressInput.value.trim();

        if (address.length === 0) {
          errorMessages.push("Address must be supplied.");
        }

        if (address.length > 200) {
          errorMessages.push("Address cannot be more than 200 characters.");
        }
      }

      if (avgRatingInput) {
        let avgRating = Number(avgRatingInput.value.trim());

        if (
          avgRatingInput.value.trim().length === 0 ||
          isNaN(avgRating) ||
          avgRating < 0 ||
          avgRating > 5
        ) {
          errorMessages.push("Average rating must be between 0 and 5.");
        }
      }

      if (reviewsCountInput) {
        let reviewsCount = Number(reviewsCountInput.value.trim());

        if (
          reviewsCountInput.value.trim().length === 0 ||
          isNaN(reviewsCount) ||
          reviewsCount < 0 ||
          !Number.isInteger(reviewsCount)
        ) {
          errorMessages.push("Reviews count must be a nonnegative whole number.");
        }
      }

      if (errorMessages.length > 0) {
        event.preventDefault();
        alert(errorMessages.join("\n"));
      }
    });
  }

  const authForms = document.querySelectorAll(
    'form[action="/register"], form[action="/signin"], form[action="/profile/edit"]',
  );

  const nameRegex = /^[a-zA-Z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 0; i < authForms.length; i++) {
    authForms[i].addEventListener("submit", function (event) {
      const firstNameInput = authForms[i].querySelector('input[name="firstName"]');
      const lastNameInput = authForms[i].querySelector('input[name="lastName"]');
      const emailInput = authForms[i].querySelector('input[name="email"]');
      const passwordInput = authForms[i].querySelector('input[name="password"]');

      const errorMessages = [];
      const action = authForms[i].getAttribute("action");

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (!email || !emailRegex.test(email)) {
        errorMessages.push("Please enter a valid email address.");
      }

      if (action === "/signin") {
        if (!password) {
          errorMessages.push("Please enter your password.");
        }
      }

      if (firstNameInput && lastNameInput) {
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();

        if (
          !firstName ||
          firstName.length < 2 ||
          firstName.length > 50 ||
          !nameRegex.test(firstName)
        ) {
          errorMessages.push("First name must be 2-50 letters and spaces only.");
        }

        if (!lastName || lastName.length < 2 || lastName.length > 50 || !nameRegex.test(lastName)) {
          errorMessages.push("Last name must be 2-50 letters and spaces only.");
        }

        if (action === "/register") {
          if (!password || password.length < 8) {
            errorMessages.push("Password must be at least 8 characters.");
          }

          if (password && password.includes(" ")) {
            errorMessages.push("Password must not contain whitespace.");
          }
        }

        if (action === "/profile/edit" && password && password.trim().length > 0) {
          if (password.length < 8) {
            errorMessages.push("Password must be at least 8 characters if provided.");
          }

          if (password.includes(" ")) {
            errorMessages.push("Password must not contain whitespace.");
          }
        }
      }

      if (errorMessages.length > 0) {
        event.preventDefault();
        alert(errorMessages.join("\n"));
      }
    });
  }
});
