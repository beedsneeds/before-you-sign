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

  const searchForm = document.querySelector(".home-search-form");

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      const searchInput = searchForm.querySelector('input[name="search"]');
      const searchValue = searchInput ? searchInput.value.trim() : "";

      if (searchValue.length === 0) {
        event.preventDefault();
        alert("Search term must be supplied.");
      }
    });
  }

  let forms = document.querySelectorAll(
    '#adminEditLookupForm, #adminEditSubmitForm, #adminDeleteLookupForm, #adminDeleteConfirmForm, form[action="/admin/add"]',
  );

  const buildingAddressRegex = /^[a-zA-Z0-9 ,.'\-#/]+$/;

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
        } else if (address.length < 5) {
          errorMessages.push("Address must be at least 5 characters.");
        } else if (address.length > 200) {
          errorMessages.push("Address cannot be more than 200 characters.");
        } else if (!/[a-zA-Z]/.test(address)) {
          errorMessages.push("Address must contain at least one letter.");
        } else if (!buildingAddressRegex.test(address)) {
          errorMessages.push("Address may only contain letters, numbers, spaces, and , . ' - # /");
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

    const validatePassword = function (password, isOptional) {
    const passwordErrors = [];
    const value = password || "";

    if (isOptional && value.trim().length === 0) {
      return passwordErrors;
    }

    if (!value || value.length < 8) {
      passwordErrors.push("Password must be at least 8 characters.");
    }

    if (value.length > 128) {
      passwordErrors.push("Password cannot be more than 128 characters.");
    }

    if (/\s/.test(value)) {
      passwordErrors.push("Password must not contain whitespace.");
    }

    if (!/[A-Z]/.test(value)) {
      passwordErrors.push("Password must contain an uppercase letter.");
    }

    if (!/[0-9]/.test(value)) {
      passwordErrors.push("Password must contain a number.");
    }

    if (!/[^a-zA-Z0-9]/.test(value)) {
      passwordErrors.push("Password must contain a special character.");
    }

    return passwordErrors;
  };

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
          errorMessages.push(...validatePassword(password, false));
        }

        if (action === "/profile/edit") {
          errorMessages.push(...validatePassword(password, true));
        }
      }

      if (errorMessages.length > 0) {
        event.preventDefault();
        alert(errorMessages.join("\n"));
      }
    });
  }
});
