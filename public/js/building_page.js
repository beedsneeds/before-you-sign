//////////Building tab
const overviewTab = document.getElementById('overview-tab');
const reviewsTab = document.getElementById('reviews-tab');
const violationsTab = document.getElementById('violations-tab');
const commentsTab = document.getElementById('comments-tab');
const associatedTab = document.getElementById('associated-tab');

const overviewSection = document.getElementById('overview');
const reviewsSection = document.getElementById('reviews');
const violationsSection = document.getElementById('violations');
const commentsSection = document.getElementById('comments');
const associatedSection = document.getElementById('associated');

function hideAllSections() {
  overviewSection.style.display = 'none';
  reviewsSection.style.display = 'none';
  violationsSection.style.display = 'none';
  commentsSection.style.display = 'none';
  associatedSection.style.display = 'none';
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
associatedTab.addEventListener('click', () => {
  hideAllSections();
  associatedSection.style.display = 'block';
});

if (window.location.search.includes('sortBy=')) {
  hideAllSections();
  violationsSection.style.display = 'block';
} else {
  overviewSection.style.display = 'flex';
}

//////Forum
const topicButtons = document.querySelectorAll('.topic-toggle');

for (let i = 0; i < topicButtons.length; i++) {
  topicButtons[i].addEventListener('click', function () {
    const topicContent = topicButtons[i].nextElementSibling;

    if (topicContent.style.display === 'block') {
      topicContent.style.display = 'none';
    } else {
      topicContent.style.display = 'block';
    }
  });
}

if (window.location.search.includes('commentSubmitted=true')) {
  hideAllSections();

  commentsSection.style.display = 'block';
}
