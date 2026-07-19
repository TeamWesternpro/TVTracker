// ============================================
// TV Tracker - Legal Modals
// ============================================

const legalContent = {
  terms: {
    icon: '&#128220;',
    title: 'Terms of Service',
    body: `
      <p><strong>Last updated:</strong> July 18, 2026</p>
      <p>Welcome to TV Tracker. By using our service, you agree to the following terms.</p>
      <h4>1. Use of Service</h4>
      <p>TV Tracker is a personal tool for tracking TV shows you watch, plan to watch, or have watched. You may use the service for personal, non-commercial purposes only.</p>
      <h4>2. User Accounts</h4>
      <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
      <h4>3. User Content</h4>
      <p>You retain ownership of any content you add to TV Tracker, including show entries, images, and metadata. By adding content, you grant us a limited license to store and display it within the service.</p>
      <h4>4. Prohibited Conduct</h4>
      <p>You agree not to misuse the service, attempt to access other users' data, or use automated tools to scrape or interact with the platform.</p>
      <h4>5. Termination</h4>
      <p>We reserve the right to suspend or terminate your account at our discretion, with or without notice, for conduct that violates these terms.</p>
      <h4>6. Disclaimer</h4>
      <p>TV Tracker is provided "as is" without warranties of any kind. We are not responsible for any data loss or service interruptions.</p>
      <h4>7. Changes to Terms</h4>
      <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
    `
  },
  privacy: {
    icon: '&#128274;',
    title: 'Privacy Policy',
    body: `
      <p><strong>Last updated:</strong> July 18, 2026</p>
      <p>Your privacy is important to us. This policy explains how TV Tracker collects and uses your data.</p>
      <h4>1. Information We Collect</h4>
      <p>We collect information you provide directly, including your email address (for account creation), show data you add, and any images you upload.</p>
      <h4>2. How We Use Your Information</h4>
      <p>We use your information to provide and improve the TV Tracker service, including storing your show data, syncing across devices, and personalizing your experience.</p>
      <h4>3. Data Storage</h4>
      <p>Your data is stored securely using Supabase, a cloud database provider. We implement industry-standard security measures to protect your information.</p>
      <h4>4. Data Sharing</h4>
      <p>We do not sell, trade, or share your personal information with third parties. Your show data and account details remain private to you.</p>
      <h4>5. Cookies</h4>
      <p>We use essential cookies to maintain your login session and provide core functionality. See our Cookie Policy for more details.</p>
      <h4>6. Data Retention</h4>
      <p>We retain your data for as long as your account is active. You may request deletion of your data at any time by contacting us.</p>
      <h4>7. Children's Privacy</h4>
      <p>TV Tracker is not intended for users under 13. We do not knowingly collect data from children.</p>
      <h4>8. Changes to This Policy</h4>
      <p>We may update this privacy policy periodically. We will notify you of significant changes through the service.</p>
    `
  },
  cookies: {
    icon: '&#127850;',
    title: 'Cookie Policy',
    body: `
      <p><strong>Last updated:</strong> July 18, 2026</p>
      <p>This policy explains how TV Tracker uses cookies and similar technologies.</p>
      <h4>1. What Are Cookies</h4>
      <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and session state.</p>
      <h4>2. Essential Cookies</h4>
      <p>TV Tracker uses essential cookies for:</p>
      <ul>
        <li><strong>Authentication:</strong> Keeping you logged in across page loads</li>
        <li><strong>Session:</strong> Maintaining your session with Supabase</li>
        <li><strong>Preferences:</strong> Remembering your filter and UI state</li>
      </ul>
      <h4>3. Local Storage</h4>
      <p>We use browser local storage to cache your show data for faster loading and offline access. This data stays on your device and is not shared with third parties.</p>
      <h4>4. Third-Party Services</h4>
      <p>Our hosting provider and Supabase may use their own cookies for analytics and service delivery. These are governed by their respective privacy policies.</p>
      <h4>5. Managing Cookies</h4>
      <p>You can control or delete cookies through your browser settings. Note that disabling essential cookies may affect the functionality of TV Tracker.</p>
      <h4>6. Changes to This Policy</h4>
      <p>We may update this cookie policy from time to time. Changes will be reflected on this page.</p>
    `
  },
  help: {
    icon: '&#10067;',
    title: 'Help Center',
    body: `
      <p>Find answers to common questions about using TV Tracker.</p>
      <h4>How do I add a new show?</h4>
      <p>Go to the <strong>Tracker</strong> page and click the <strong>"+ Add Show"</strong> button. Fill in the details like title, description, status, and optionally upload a poster image. You can also add creators and cast members.</p>
      <h4>How do I edit or delete a show?</h4>
      <p>Hover over any show card on the Tracker page. You'll see edit (pencil) and delete (trash) buttons appear in the top-right corner of the card.</p>
      <h4>What do the status colors mean?</h4>
      <ul>
        <li><strong>Currently Watching</strong> (Yellow) — Shows you're actively watching</li>
        <li><strong>Watched</strong> (Green) — Shows you've completed</li>
        <li><strong>Plan to Watch</strong> (Purple) — Shows on your watchlist</li>
        <li><strong>Upcoming</strong> (Red) — Shows that haven't aired yet</li>
      </ul>
      <h4>How does the Calendar work?</h4>
      <p>The Calendar page displays release dates for all your tracked shows. You can also add upcoming shows directly from the calendar using the "+ Add Upcoming Show" button.</p>
      <h4>Can I search for shows?</h4>
      <p>Yes! Use the search bar at the top of the Tracker page to filter shows by title in real time.</p>
      <h4>Is my data private?</h4>
      <p>Yes. Your shows and account information are stored securely and are only visible to you. See our <strong>Privacy Policy</strong> for more details.</p>
    `
  },
  feedback: {
    icon: '&#128172;',
    title: 'Send Feedback',
    body: `
      <p>We'd love to hear from you! Your feedback helps us improve TV Tracker.</p>
      <h4>What kind of feedback?</h4>
      <p>All types are welcome — bug reports, feature requests, design suggestions, or general thoughts about the app.</p>
      <h4>How to send feedback</h4>
      <p>Reach out to us through any of these channels:</p>
      <ul>
        <li><strong>Email:</strong> feedback@tvtracker.app</li>
        <li><strong>GitHub:</strong> Open an issue on our repository</li>
        <li><strong>In-App:</strong> Use the feedback link in the footer anytime</li>
      </ul>
      <h4>Response time</h4>
      <p>We aim to respond to all feedback within 48 hours. For urgent issues, please mention "URGENT" in your subject line.</p>
      <h4>Feature requests</h4>
      <p>Have an idea for TV Tracker? We're always looking for ways to make the app better. Describe your idea in detail and we'll consider it for future updates.</p>
      <p style="margin-top:1.5rem; color: var(--gold); font-weight: 600;">Thank you for helping us improve!</p>
    `
  }
};

function openLegalModal(type) {
  const content = legalContent[type];
  if (!content) return;

  const existing = document.getElementById('legalModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'legalModal';
  modal.innerHTML = `
    <div class="modal legal-modal">
      <div class="legal-header">
        <span class="legal-icon">${content.icon}</span>
        <h2 class="legal-title">${content.title}</h2>
        <button class="modal-close" onclick="closeLegalModal()">&times;</button>
      </div>
      <div class="legal-body">
        ${content.body}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));
  modal.addEventListener('click', e => { if (e.target === modal) closeLegalModal(); });
}

function closeLegalModal() {
  const modal = document.getElementById('legalModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}
