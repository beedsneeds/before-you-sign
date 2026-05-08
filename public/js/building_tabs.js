const overviewTab = document.getElementById('overview-tab');
const reviewsTab = document.getElementById('reviews-tab');
const violationsTab = document.getElementById('violations-tab');
const commentsTab = document.getElementById('comments-tab');

const overviewSection = document.getElementById('overview');
const reviewsSection = document.getElementById('reviews');
const violationsSection = document.getElementById('violations');
const commentsSection = document.getElementById('comments');

function hideAllSections() {
  overviewSection.style.display = 'none';
  reviewsSection.style.display = 'none';
  violationsSection.style.display = 'none';
  commentsSection.style.display = 'none';
}

overviewTab.addEventListener('click', () => {
  hideAllSections();
  overviewSection.style.display = 'flex';
});

reviewsTab.addEventListener('click', () => {
  hideAllSections();
  reviewsSection.style.display = 'block';
});

violationsTab.addEventListener('click', () => {
  hideAllSections();
  violationsSection.style.display = 'block';
});

commentsTab.addEventListener('click', () => {
  hideAllSections();
  commentsSection.style.display = 'block';
});

overviewSection.style.display = 'flex';