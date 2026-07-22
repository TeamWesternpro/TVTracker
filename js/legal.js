// ============================================
// TV Tracker - Legal Modals & Discord Webhooks
// ============================================

const DISCORD_WEBHOOKS = {
  features: 'https://discord.com/api/webhooks/1529422917606051951/Bc6-rXl0HKDOrAgksXuJa5XZLAGq6_EL-Cs323daVqMOC3nyx4fAbDirs1LQ4fkGYhHp',
  feedback: 'https://discord.com/api/webhooks/1529423048875184288/ggVvrDL4wmr0DFqXimvSXsUWE9fnzHwOMQa_a7aaLjXkloALRjA8Muy1M7XWGM3KhUT4'
};

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
    title: 'Feature Request',
    isForm: true
  },
  feedback: {
    icon: '&#128172;',
    title: 'Send Feedback',
    isForm: true
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

  if (content.isForm && (type === 'help' || type === 'feedback')) {
    const formType = type === 'help' ? 'Feature Request' : 'Feedback / Support';
    const placeholder = type === 'help'
      ? 'Describe the feature you\'d like to see in TV Tracker...'
      : 'Tell us about any issue or feedback you have...';
    const webhookType = type === 'help' ? 'features' : 'feedback';

    modal.innerHTML = `
      <div class="modal legal-modal">
        <div class="legal-header">
          <span class="legal-icon">${content.icon}</span>
          <h2 class="legal-title">${content.title}</h2>
          <button class="modal-close" onclick="closeLegalModal()">&times;</button>
        </div>
        <div class="legal-body">
          <p>Submit your ${formType.toLowerCase()} below. It will be sent directly to our team via Discord.</p>
          <form id="webhookForm" onsubmit="handleWebhookSubmit(event, '${webhookType}')">
            <div class="form-group">
              <label class="form-label">Your Message *</label>
              <textarea class="form-textarea webhook-textarea" id="webhookMessage" placeholder="${placeholder}" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="form-btn-cancel" onclick="closeLegalModal()">Cancel</button>
              <button type="submit" class="form-btn-save webhook-submit" id="webhookSubmitBtn">Send ${formType}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  } else {
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
  }

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));
  modal.addEventListener('click', e => { if (e.target === modal) closeLegalModal(); });
}

async function handleWebhookSubmit(e, type) {
  e.preventDefault();
  const message = document.getElementById('webhookMessage').value.trim();
  if (!message) return;

  const btn = document.getElementById('webhookSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  let userEmail = 'Anonymous';
  try {
    if (typeof supabaseClient !== 'undefined') {
      const { data } = await supabaseClient.auth.getSession();
      if (data.session?.user?.email) userEmail = data.session.user.email;
    }
  } catch (err) {}

  const label = type === 'features' ? 'Feature Request' : 'Feedback';
  const color = type === 'features' ? 5814783 : 16750848;

  const embed = {
    title: `📨 New ${label}`,
    description: message,
    color: color,
    fields: [
      { name: 'User', value: userEmail, inline: true },
      { name: 'Type', value: label, inline: true },
      { name: 'Page', value: window.location.pathname.split('/').pop() || 'index.html', inline: true }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'TV Tracker' }
  };

  try {
    await fetch(DISCORD_WEBHOOKS[type], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    btn.textContent = 'Sent!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    setTimeout(() => closeLegalModal(), 1500);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = `Send ${label}`;
    alert('Failed to send. Please try again.');
  }
}

function closeLegalModal() {
  const modal = document.getElementById('legalModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}
