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
});