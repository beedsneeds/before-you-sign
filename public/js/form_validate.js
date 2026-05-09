document.addEventListener('DOMContentLoaded', function () {
  let darkModeButton = document.getElementById('darkModeToggle');

  // If the user previously turned dark mode on, keep it on after refresh.
  if (localStorage.getItem('darkMode') === 'on') {
    document.body.classList.add('dark-mode');

    if (darkModeButton) {
      darkModeButton.innerText = 'Light Mode';
    }
  }

  // If the button exists on the page, make it switch dark mode on/off.
  if (darkModeButton) {
    darkModeButton.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');

      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'on');
        darkModeButton.innerText = 'Light Mode';
      } else {
        localStorage.setItem('darkMode', 'off');
        darkModeButton.innerText = 'Dark Mode';
      }
    });
  }

  let forms = document.querySelectorAll(
    '#adminEditLookupForm, #adminEditSubmitForm, #adminDeleteLookupForm, #adminDeleteConfirmForm, form[action="/admin/add"]',
  );

  for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function (event) {
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
          errorMessages.push('BIN number must be a positive whole number.');
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
          errorMessages.push('Original BIN must be a positive whole number.');
        }
      }

      if (addressInput) {
        let address = addressInput.value.trim();

        if (address.length === 0) {
          errorMessages.push('Address must be supplied.');
        }

        if (address.length > 200) {
          errorMessages.push('Address cannot be more than 200 characters.');
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
          errorMessages.push('Average rating must be between 0 and 5.');
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
          errorMessages.push('Reviews count must be a nonnegative whole number.');
        }
      }

      if (errorMessages.length > 0) {
        event.preventDefault();
        alert(errorMessages.join('\n'));
      }
    });
  }
});