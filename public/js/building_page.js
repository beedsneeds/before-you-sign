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

// stay on overview after submit
if (window.location.search.includes('commentSubmitted=true')) {
  hideAllSections();

  commentsSection.style.display = 'block';
}

if (window.location.search.includes('reviewSubmitted=true')) {
  hideAllSections();

  reviewsSection.style.display = 'block';
}


// review validation
const reviewForm = document.querySelector('#reviews form');

if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    const reviewText = document.getElementById('reviewText').value.trim();
    const rating = Number(document.getElementById('rating').value);
    

    if (!reviewText || reviewText.length < 10) {
      e.preventDefault();
      alert('Review must be at least 10 characters.');
    }

    if (rating < 1 || rating > 5) {
      e.preventDefault();
      alert('Rating must be between 1 and 5.');
    }
  });
}

// comment and topic validation
const commentForm = document.querySelector('#comments > form');

if (commentForm) {
  commentForm.addEventListener('submit', function(e) {
    const title = document.getElementById('topicTitle').value.trim();

    if (!title || title.length <5) {
      e.preventDefault();
      alert('Topic name cannot be empty.');
    }
  });
}

// reply validation
const replyforms = document.querySelectorAll('.topic-content form');

for (let i = 0; i < replyforms.length; i++) {
  replyforms[i].addEventListener('submit', function (e) {
    const textInReply = this.querySelector('[name="replyText"]').value.trim();

    if (!textInReply || textInReply.length < 1) {
      e.preventDefault();
      alert('Reply cannot be empty.');
    }
  });
}