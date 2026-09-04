// ============================================
// TV Tracker - Calendar Utilities
// ============================================

const CAL_EVENTS_KEY = 'tvTracker_calEvents';

// Static holidays keyed by "MM-DD"
const HOLIDAYS_STATIC = {
  '01-01': { name: "New Year's Day", emoji: '🎉' },
  '01-06': { name: 'Epiphany', emoji: '⭐' },
  '02-02': { name: 'Groundhog Day', emoji: '🐿️' },
  '02-14': { name: "Valentine's Day", emoji: '❤️' },
  '03-08': { name: "International Women's Day", emoji: '💜' },
  '03-17': { name: "St. Patrick's Day", emoji: '☘️' },
  '04-01': { name: "April Fools' Day", emoji: '🤡' },
  '04-22': { name: 'Earth Day', emoji: '🌍' },
  '05-04': { name: 'Star Wars Day', emoji: '⚔️' },
  '05-05': { name: 'Cinco de Mayo', emoji: '🌮' },
  '06-14': { name: 'Flag Day', emoji: '🇺🇸' },
  '06-19': { name: 'Juneteenth', emoji: '✊' },
  '07-04': { name: 'Independence Day', emoji: '🎆' },
  '10-31': { name: 'Halloween', emoji: '🎃' },
  '11-11': { name: "Veterans Day", emoji: '🎖️' },
  '12-24': { name: 'Christmas Eve', emoji: '🎄' },
  '12-25': { name: 'Christmas Day', emoji: '🎁' },
  '12-31': { name: "New Year's Eve", emoji: '🥂' }
};

function computeEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function nthWeekdayOfMonth(year, month, weekday, n) {
  let day = 1;
  while (new Date(year, month, day).getDay() !== weekday) day++;
  return day + (n - 1) * 7;
}

function lastWeekdayOfMonth(year, month, weekday) {
  let day = new Date(year, month + 1, 0).getDate();
  while (new Date(year, month, day).getDay() !== weekday) day--;
  return day;
}

function computeVariableHolidays(year) {
  const h = {};

  const easter = computeEaster(year);
  h[`${String(easter.month).padStart(2,'0')}-${String(easter.day).padStart(2,'0')}`] = { name: 'Easter Sunday', emoji: '🐣' };
  const easterDt = new Date(year, easter.month - 1, easter.day);
  const ashWed = new Date(easterDt);
  ashWed.setDate(ashWed.getDate() - 46);
  h[`${String(ashWed.getMonth()+1).padStart(2,'0')}-${String(ashWed.getDate()).padStart(2,'0')}`] = { name: 'Ash Wednesday', emoji: '✝️' };
  const goodFri = new Date(easterDt);
  goodFri.setDate(goodFri.getDate() - 2);
  h[`${String(goodFri.getMonth()+1).padStart(2,'0')}-${String(goodFri.getDate()).padStart(2,'0')}`] = { name: 'Good Friday', emoji: '🙏' };

  h[`01-${nthWeekdayOfMonth(year, 0, 1, 3)}`] = { name: "Martin Luther King Jr. Day", emoji: '🕊️' };
  h[`02-${nthWeekdayOfMonth(year, 1, 1, 3)}`] = { name: "Presidents' Day", emoji: '🇺🇸' };
  h[`05-${nthWeekdayOfMonth(year, 4, 0, 2)}`] = { name: "Mother's Day", emoji: '💐' };
  h[`05-${lastWeekdayOfMonth(year, 4, 1)}`] = { name: 'Memorial Day', emoji: '🇺🇸' };
  h[`06-${nthWeekdayOfMonth(year, 5, 0, 3)}`] = { name: "Father's Day", emoji: '👔' };
  h[`09-${nthWeekdayOfMonth(year, 8, 1, 1)}`] = { name: 'Labor Day', emoji: '⚒️' };
  h[`10-${nthWeekdayOfMonth(year, 9, 1, 2)}`] = { name: 'Columbus Day', emoji: '🧭' };

  const nov22to28 = [];
  for (let d = 22; d <= 28; d++) {
    if (new Date(year, 10, d).getDay() === 4) nov22to28.push(d);
  }
  h[`11-${nov22to28[nov22to28.length - 1]}`] = { name: 'Thanksgiving', emoji: '🦃' };

  return h;
}

function buildHolidayMap(year) {
  const map = {};
  for (const [key, val] of Object.entries(HOLIDAYS_STATIC)) {
    map[key] = val;
  }
  const variable = computeVariableHolidays(year);
  for (const [key, val] of Object.entries(variable)) {
    map[key] = val;
  }
  return map;
}

function getHolidayForDate(dateStr, holidayMap) {
  const mmdd = dateStr.substring(5);
  return holidayMap ? holidayMap[mmdd] || null : HOLIDAYS_STATIC[mmdd] || null;
}

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
