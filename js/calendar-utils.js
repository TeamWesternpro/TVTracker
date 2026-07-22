// ============================================
// TV Tracker - Calendar Utilities
// ============================================

const CAL_EVENTS_KEY = 'tvTracker_calEvents';

function getCalEvents() {
  try {
    return JSON.parse(localStorage.getItem(CAL_EVENTS_KEY) || '[]');
  } catch (e) { return []; }
}

function saveCalEvents(events) {
  localStorage.setItem(CAL_EVENTS_KEY, JSON.stringify(events));
}

function isCalEventDuplicate(title, date) {
  const events = getCalEvents();
  return events.some(e => e.title.toLowerCase() === title.toLowerCase() && e.releaseDate === date);
}

function addCalEvent(event) {
  const events = getCalEvents();
  events.push({ id: Date.now(), ...event });
  saveCalEvents(events);
}

function removeCalEvent(id) {
  const events = getCalEvents().filter(e => e.id !== id);
  saveCalEvents(events);
}

function formatCalDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatCalDateOnly(dateStr) {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '');
}

function icsEscape(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function generateICS(title, date, description, platform) {
  const dtStart = formatCalDateOnly(date);
  const dtEnd = formatCalDateOnly(date);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const desc = icsEscape(`${description || ''}${platform ? '\\nPlatform: ' + platform : ''}${window.location.origin ? '\\n' + window.location.origin + '/calendar.html' : ''}`);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TV Tracker//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
DTSTAMP:${now}
UID:${Date.now()}@tvtracker
SUMMARY:${icsEscape(title)}
DESCRIPTION:${desc}
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT
END:VCALENDAR`;
}

function downloadICS(title, date, description, platform) {
  const ics = generateICS(title, date, description, platform);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getGoogleCalendarUrl(title, date, description, platform) {
  if (!date) return '#';
  const d = new Date(date + 'T09:00:00');
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);
  const fmt = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const fmtEnd = nextDay.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const details = `${description || ''}${platform ? '\nPlatform: ' + platform : ''}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt}/${fmtEnd}&details=${encodeURIComponent(details)}`;
}

function getOutlookCalendarUrl(title, date, description, platform) {
  if (!date) return '#';
  const d = new Date(date + 'T09:00:00');
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);
  const fmt = d.toISOString().split('.')[0];
  const fmtEnd = nextDay.toISOString().split('.')[0];
  const body = `${description || ''}${platform ? '\nPlatform: ' + platform : ''}`;
  return `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(title)}&startdt=${fmt}&enddt=${fmtEnd}&body=${encodeURIComponent(body)}`;
}

function getYahooCalendarUrl(title, date, description, platform) {
  if (!date) return '#';
  const d = new Date(date + 'T09:00:00');
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);
  const fmt = d.toISOString().split('.')[0];
  const fmtEnd = nextDay.toISOString().split('.')[0];
  const desc = `${description || ''}${platform ? ' Platform: ' + platform : ''}`;
  return `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(title)}&st=${fmt}&et=${fmtEnd}&desc=${encodeURIComponent(desc)}`;
}

function getAppleCalendarUrl(title, date, description, platform) {
  const ics = generateICS(title, date, description, platform);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function renderPersonalCalendarButtons(title, date, description, platform) {
  if (!date) return '';
  const gUrl = getGoogleCalendarUrl(title, date, description, platform);
  const oUrl = getOutlookCalendarUrl(title, date, description, platform);
  const yUrl = getYahooCalendarUrl(title, date, description, platform);
  return `
    <div class="personal-calendar-buttons">
      <a href="${gUrl}" target="_blank" rel="noopener" class="cal-btn google">Google Calendar</a>
      <a href="${oUrl}" target="_blank" rel="noopener" class="cal-btn outlook">Outlook</a>
      <a href="${yUrl}" target="_blank" rel="noopener" class="cal-btn yahoo">Yahoo Calendar</a>
      <button type="button" class="cal-btn apple" onclick="event.preventDefault(); downloadICS('${icsEscape(title)}', '${date}', '${icsEscape(description)}', '${icsEscape(platform)}')">Download .ics</button>
    </div>
  `;
}
