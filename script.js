const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-navigation');
const aboutDropdown = document.querySelector('.nav-dropdown');
const aboutDropdownTrigger = document.querySelector('.nav-dropdown-trigger');

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
    menuToggle.querySelector('.sr-only').textContent = isOpen ? 'Open navigation' : 'Close navigation';
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      menuToggle.querySelector('.sr-only').textContent = 'Open navigation';
      aboutDropdown?.classList.remove('is-open');
      aboutDropdownTrigger?.setAttribute('aria-expanded', 'false');
    }
  });
}

if (aboutDropdown && aboutDropdownTrigger) {
  aboutDropdownTrigger.addEventListener('click', () => {
    const isOpen = aboutDropdownTrigger.getAttribute('aria-expanded') === 'true';
    aboutDropdownTrigger.setAttribute('aria-expanded', String(!isOpen));
    aboutDropdown.classList.toggle('is-open', !isOpen);
  });

  document.addEventListener('click', (event) => {
    if (!aboutDropdown.contains(event.target)) {
      aboutDropdown.classList.remove('is-open');
      aboutDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && aboutDropdownTrigger.getAttribute('aria-expanded') === 'true') {
      aboutDropdown.classList.remove('is-open');
      aboutDropdownTrigger.setAttribute('aria-expanded', 'false');
      aboutDropdownTrigger.focus();
    }
  });
}

const heroAnimation = document.querySelector('.hero-animation');
if (heroAnimation) {
  const reducedMotionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const syncHeroAnimationPlayback = () => {
    if (reducedMotionPreference?.matches) {
      heroAnimation.pause();
      return;
    }
    heroAnimation.play().catch(() => {});
  };

  syncHeroAnimationPlayback();
  reducedMotionPreference.addEventListener?.('change', syncHeroAnimationPlayback);
}

const teamCalendarStorageKey = 'west-acres-team-calendar-events-v1';
const seededTeamEvents = [
  {
    id: 'harvest-hangout-2026-10-04',
    title: 'Harvest Hangout',
    date: '2026-10-04',
    time: '15:00',
    location: '900-922 Orchard Park Dr Fargo, ND 58104',
    details: ''
  },
  {
    id: 'christmas-party-2026-12-13',
    title: 'Christmas Party',
    date: '2026-12-13',
    time: '17:00',
    endTime: '20:00',
    location: '4100 13th Ave S, Fargo, ND 58103',
    details: ''
  },
  {
    id: 'friendsgiving-2026-11-08',
    title: 'Friendsgiving',
    date: '2026-11-08',
    time: '17:00',
    location: '4100 13th Ave S, Fargo, ND 58103',
    details: ''
  }
];

const readTeamCalendarEvents = () => {
  const eventsById = new Map(seededTeamEvents.map((calendarEvent) => [calendarEvent.id, calendarEvent]));
  try {
    const stored = window.localStorage.getItem(teamCalendarStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    if (Array.isArray(parsed)) {
      parsed.forEach((calendarEvent) => {
        if (!calendarEvent || typeof calendarEvent.title !== 'string' || typeof calendarEvent.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(calendarEvent.date)) return;
        const id = typeof calendarEvent.id === 'string' ? calendarEvent.id : `${calendarEvent.date}-${calendarEvent.title}`;
        eventsById.set(id, {
          id,
          title: calendarEvent.title,
          date: calendarEvent.date,
          time: typeof calendarEvent.time === 'string' ? calendarEvent.time : '',
          endTime: typeof calendarEvent.endTime === 'string' ? calendarEvent.endTime : '',
          location: typeof calendarEvent.location === 'string' ? calendarEvent.location : '',
          details: typeof calendarEvent.details === 'string' ? calendarEvent.details : ''
        });
      });
    }
  } catch {
    // The seeded announcement still works when browser storage is unavailable.
  }
  seededTeamEvents.forEach((seededEvent) => {
    eventsById.set(seededEvent.id, { ...eventsById.get(seededEvent.id), ...seededEvent });
  });
  return Array.from(eventsById.values());
};

const nextUpcomingTeamEvent = () => {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return readTeamCalendarEvents()
    .filter((calendarEvent) => {
      if (calendarEvent.date > todayKey) return true;
      if (calendarEvent.date < todayKey) return false;
      if (!/^\d{2}:\d{2}$/.test(calendarEvent.time || '')) return true;
      const [year, month, day] = calendarEvent.date.split('-').map(Number);
      const [hour, minute] = calendarEvent.time.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute) >= now;
    })
    .sort((first, second) => first.date.localeCompare(second.date) || first.time.localeCompare(second.time))[0] || null;
};

const calendarSeasonClass = (monthIndex) => {
  if (monthIndex === 11 || monthIndex <= 1) return 'calendar-season-winter';
  if (monthIndex <= 4) return 'calendar-season-spring';
  if (monthIndex <= 7) return 'calendar-season-summer';
  return 'calendar-season-fall';
};

const formatTeamEventDate = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(year, month - 1, day));
};

const formatTeamEventTime = (timeValue, endTime = '') => {
  if (!/^\d{2}:\d{2}$/.test(timeValue || '')) return '';
  const formatOneTime = (value, includePeriod = true) => {
    const [hourValue, minuteValue] = value.split(':').map(Number);
    const hour = hourValue % 12 || 12;
    const period = hourValue >= 12 ? 'PM' : 'AM';
    return `${hour}${minuteValue === 0 ? '' : `:${String(minuteValue).padStart(2, '0')}`}${includePeriod ? ` ${period}` : ''}`;
  };
  const startPeriod = Number(timeValue.slice(0, 2)) >= 12 ? 'PM' : 'AM';
  const endPeriod = Number(endTime.slice(0, 2)) >= 12 ? 'PM' : 'AM';
  const start = formatOneTime(timeValue, !endTime || startPeriod !== endPeriod);
  const end = /^\d{2}:\d{2}$/.test(endTime) ? formatOneTime(endTime) : '';
  return end ? `${start}–${end}` : `${formatOneTime(timeValue)}${endTime ? `–${endTime}` : ''}`;
};

document.querySelectorAll('.leader-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const card = toggle.closest('.leader-card');
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    toggle.setAttribute('aria-expanded', String(!isExpanded));
    const toggleLabel = toggle.querySelector('.sr-only');
    if (toggleLabel) toggleLabel.textContent = isExpanded ? 'Show responsibilities' : 'Hide responsibilities';
    card?.classList.toggle('is-expanded', !isExpanded);
  });
});

document.querySelectorAll('.org-chart-director-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const card = toggle.closest('.org-chart-director-card');
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    toggle.setAttribute('aria-expanded', String(!isExpanded));
    card?.classList.toggle('is-expanded', !isExpanded);
  });
});

const orgChart = document.querySelector('.org-chart');

if (orgChart) {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const hierarchyLines = document.createElementNS(svgNamespace, 'svg');
  hierarchyLines.setAttribute('class', 'org-chart-hierarchy-lines');
  hierarchyLines.setAttribute('aria-hidden', 'true');
  orgChart.prepend(hierarchyLines);

  const drawOrgChartLines = () => {
    const chartRect = orgChart.getBoundingClientRect();
    if (!chartRect.width || !chartRect.height) return;

    hierarchyLines.setAttribute('viewBox', `0 0 ${chartRect.width} ${chartRect.height}`);
    hierarchyLines.replaceChildren();

    const position = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - chartRect.left,
        right: rect.right - chartRect.left,
        top: rect.top - chartRect.top,
        bottom: rect.bottom - chartRect.top,
        centerX: rect.left + rect.width / 2 - chartRect.left,
      };
    };

    const addPath = (pathData) => {
      const path = document.createElementNS(svgNamespace, 'path');
      path.setAttribute('d', pathData);
      hierarchyLines.append(path);
    };

    const connectDirectorToDepartment = (directorId, ladderId) => {
      const director = orgChart.querySelector(`[aria-controls="${directorId}"]`)?.closest('.org-chart-director-card');
      const supervisor = orgChart.querySelector(`#${ladderId} + .org-chart-ladder .org-chart-role-summary`);
      if (!director || !supervisor || !supervisor.getClientRects().length) return;

      const from = position(director);
      const to = position(supervisor);
      const directors = position(orgChart.querySelector('.org-chart-directors'));
      const junctionY = Math.min(directors.bottom + 8, to.top - 8);
      addPath(`M ${from.centerX} ${from.bottom} V ${junctionY} H ${to.centerX} V ${to.top}`);
    };

    connectDirectorToDepartment('foh-director-responsibilities', 'foh-ladder-title');
    connectDirectorToDepartment('boh-director-responsibilities', 'boh-ladder-title');

    const departmentLadders = Array.from(orgChart.querySelectorAll('.org-chart-department-ladder'));
    const assistantLeaders = departmentLadders
      .map((ladder) => Array.from(ladder.querySelectorAll('.org-chart-role-summary')).at(-1))
      .filter(Boolean)
      .map(position);
    const trainers = orgChart.querySelector('.org-chart-shared-ladder .org-chart-level');

    if (assistantLeaders.length === 2 && trainers?.getClientRects().length) {
      const trainer = position(trainers);
      const junctionY = Math.min(Math.max(...assistantLeaders.map((leader) => leader.bottom)) + 9, trainer.top - 8);
      const centerX = trainer.centerX;
      const [first, second] = assistantLeaders;
      addPath(`M ${first.centerX} ${first.bottom} V ${junctionY} H ${centerX} V ${trainer.top} M ${second.centerX} ${second.bottom} V ${junctionY} H ${centerX}`);
    }
  };

  drawOrgChartLines();
  orgChart.querySelector('.org-chart-expansion')?.addEventListener('toggle', () => requestAnimationFrame(drawOrgChartLines));
  window.addEventListener('resize', drawOrgChartLines, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(drawOrgChartLines).observe(orgChart);
}

const announcementsCarousel = document.querySelector('[data-announcements-carousel]');

const openFaqFromHash = () => {
  if (!window.location.hash) return;
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (target?.matches('.portal-faq-list details')) {
    target.open = true;
    target.scrollIntoView({ block: 'start' });
  }
};

openFaqFromHash();
window.addEventListener('hashchange', openFaqFromHash);

if (announcementsCarousel) {
  const announcementSlides = Array.from(announcementsCarousel.querySelectorAll('[data-announcement-slide]'));
  const announcementIndicators = Array.from(announcementsCarousel.querySelectorAll('[data-announcement-indicator]'));
  const announcementCount = announcementsCarousel.querySelector('[data-announcement-count]');
  const previousAnnouncement = announcementsCarousel.querySelector('[data-previous-announcement]');
  const nextAnnouncement = announcementsCarousel.querySelector('[data-next-announcement]');
  const toggleAnnouncements = announcementsCarousel.querySelector('[data-toggle-announcements]');
  const nextTeamEventTitle = announcementsCarousel.querySelector('[data-next-team-event-title]');
  const nextTeamEventMeta = announcementsCarousel.querySelector('[data-next-team-event-meta]');
  const nextTeamEventLink = announcementsCarousel.querySelector('.portal-announcement-slide-link');
  const nextTeamEventSlide = nextTeamEventTitle?.closest('.portal-announcement-event');
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let currentAnnouncement = 0;
  let manuallyPaused = reduceMotion;
  let pointerInside = false;
  let focusInside = false;
  let rotationTimer;

  const updateNextTeamEvent = () => {
    if (!nextTeamEventTitle || !nextTeamEventMeta) return;
    const nextEvent = nextUpcomingTeamEvent();
    nextTeamEventTitle.textContent = nextEvent ? nextEvent.title : 'No upcoming team events';
    nextTeamEventMeta.textContent = nextEvent
      ? [formatTeamEventDate(nextEvent.date), formatTeamEventTime(nextEvent.time, nextEvent.endTime)].filter(Boolean).join(' · ')
      : 'Check the calendar for updates.';
    if (nextTeamEventSlide) {
      ['calendar-season-winter', 'calendar-season-spring', 'calendar-season-summer', 'calendar-season-fall']
        .forEach((seasonClass) => nextTeamEventSlide.classList.remove(seasonClass));
      if (nextEvent) {
        const eventMonth = Number(nextEvent.date.slice(5, 7)) - 1;
        nextTeamEventSlide.classList.add(calendarSeasonClass(eventMonth));
      }
    }
    if (nextTeamEventLink) {
      nextTeamEventLink.href = nextEvent
        ? `team-portal-calendar.html?month=${encodeURIComponent(nextEvent.date.slice(0, 7))}`
        : 'team-portal-calendar.html';
    }
  };

  const showAnnouncement = (index) => {
    currentAnnouncement = (index + announcementSlides.length) % announcementSlides.length;

    announcementSlides.forEach((slide, slideIndex) => {
      const isCurrent = slideIndex === currentAnnouncement;
      slide.hidden = !isCurrent;
      slide.setAttribute('aria-label', `${slideIndex + 1} of ${announcementSlides.length}`);
    });

    announcementIndicators.forEach((indicator, indicatorIndex) => {
      const isCurrent = indicatorIndex === currentAnnouncement;
      indicator.classList.toggle('is-current', isCurrent);
      indicator.setAttribute('aria-pressed', String(isCurrent));
    });

    if (announcementCount) {
      announcementCount.textContent = `${currentAnnouncement + 1} / ${announcementSlides.length}`;
    }
  };

  const updateAnnouncementRotation = () => {
    window.clearInterval(rotationTimer);
    const shouldPause = manuallyPaused || pointerInside || focusInside || document.hidden;

    if (toggleAnnouncements) {
      toggleAnnouncements.textContent = manuallyPaused ? 'Play' : 'Pause';
      toggleAnnouncements.setAttribute('aria-pressed', String(manuallyPaused));
      toggleAnnouncements.setAttribute('aria-label', manuallyPaused ? 'Play automatic rotation' : 'Pause automatic rotation');
    }

    if (!shouldPause && announcementSlides.length > 1) {
      rotationTimer = window.setInterval(() => showAnnouncement(currentAnnouncement + 1), 6500);
    }
  };

  previousAnnouncement?.addEventListener('click', () => {
    showAnnouncement(currentAnnouncement - 1);
    updateAnnouncementRotation();
  });

  nextAnnouncement?.addEventListener('click', () => {
    showAnnouncement(currentAnnouncement + 1);
    updateAnnouncementRotation();
  });

  announcementIndicators.forEach((indicator) => {
    indicator.addEventListener('click', () => {
      showAnnouncement(Number(indicator.dataset.announcementIndicator));
      updateAnnouncementRotation();
    });
  });

  toggleAnnouncements?.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    updateAnnouncementRotation();
  });

  announcementsCarousel.addEventListener('mouseenter', () => {
    pointerInside = true;
    updateAnnouncementRotation();
  });
  announcementsCarousel.addEventListener('mouseleave', () => {
    pointerInside = false;
    updateAnnouncementRotation();
  });
  announcementsCarousel.addEventListener('focusin', () => {
    focusInside = true;
    updateAnnouncementRotation();
  });
  announcementsCarousel.addEventListener('focusout', (event) => {
    focusInside = announcementsCarousel.contains(event.relatedTarget);
    updateAnnouncementRotation();
  });
  document.addEventListener('visibilitychange', updateAnnouncementRotation);
  window.addEventListener('storage', (event) => {
    if (event.key === teamCalendarStorageKey) updateNextTeamEvent();
  });

  updateNextTeamEvent();
  showAnnouncement(0);
  updateAnnouncementRotation();
}

const teamCalendar = document.querySelector('[data-team-calendar]');

if (teamCalendar) {
  const calendarPeriod = teamCalendar.querySelector('[data-calendar-period]');
  const monthSelect = teamCalendar.querySelector('[data-calendar-month]');
  const monthSelectWrap = teamCalendar.querySelector('[data-calendar-month-select-wrap]');
  const monthView = teamCalendar.querySelector('[data-calendar-month-view]');
  const yearView = teamCalendar.querySelector('[data-calendar-year-view]');
  const daysGrid = teamCalendar.querySelector('[data-calendar-days]');
  const previousButton = teamCalendar.querySelector('[data-calendar-previous]');
  const nextButton = teamCalendar.querySelector('[data-calendar-next]');
  const viewButtons = Array.from(teamCalendar.querySelectorAll('[data-calendar-view]'));
  const today = new Date();
  let selectedMonth = today.getMonth();
  let selectedYear = today.getFullYear();
  const requestedMonth = new URLSearchParams(window.location.search).get('month') || '';
  const requestedMonthMatch = /^(\d{4})-(\d{1,2})$/.exec(requestedMonth);
  if (requestedMonthMatch) {
    const requestedYear = Number(requestedMonthMatch[1]);
    const requestedMonthNumber = Number(requestedMonthMatch[2]);
    if (requestedMonthNumber >= 1 && requestedMonthNumber <= 12) {
      selectedYear = requestedYear;
      selectedMonth = requestedMonthNumber - 1;
    }
  }
  let calendarView = 'month';
  let calendarEvents = [];

  const makeElement = (tag, className = '', text = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const displayDate = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(year, month - 1, day));
  };

  const displayTime = (timeValue, endTime = '') => {
    if (!/^\d{2}:\d{2}$/.test(timeValue || '')) return timeValue || '';
    const formatOneTime = (value, includePeriod = true) => {
      const [hourValue, minuteValue] = value.split(':').map(Number);
      const period = hourValue >= 12 ? 'PM' : 'AM';
      const hour = hourValue % 12 || 12;
      return `${hour}${minuteValue ? `:${String(minuteValue).padStart(2, '0')}` : ''}${includePeriod ? ` ${period}` : ''}`;
    };
    const startPeriod = Number(timeValue.slice(0, 2)) >= 12 ? 'PM' : 'AM';
    const endPeriod = Number(endTime.slice(0, 2)) >= 12 ? 'PM' : 'AM';
    const start = formatOneTime(timeValue, !endTime || startPeriod !== endPeriod);
    const end = /^\d{2}:\d{2}$/.test(endTime) ? formatOneTime(endTime) : '';
    return end ? `${start}–${end}` : `${formatOneTime(timeValue)}${endTime ? `–${endTime}` : ''}`;
  };

  const eventsForDate = (dateKey) => calendarEvents
    .filter((calendarEvent) => calendarEvent.date === dateKey)
    .sort((first, second) => first.title.localeCompare(second.title));
  try {
    const savedEvents = window.localStorage.getItem(teamCalendarStorageKey);
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      if (Array.isArray(parsedEvents)) {
        calendarEvents = parsedEvents.filter((calendarEvent) => (
          calendarEvent
          && typeof calendarEvent.title === 'string'
          && typeof calendarEvent.date === 'string'
          && /^\d{4}-\d{2}-\d{2}$/.test(calendarEvent.date)
        )).map((calendarEvent) => ({
          id: typeof calendarEvent.id === 'string' ? calendarEvent.id : `${calendarEvent.date}-${calendarEvent.title}`,
          title: calendarEvent.title,
          date: calendarEvent.date,
          time: typeof calendarEvent.time === 'string' ? calendarEvent.time : '',
          endTime: typeof calendarEvent.endTime === 'string' ? calendarEvent.endTime : '',
          location: typeof calendarEvent.location === 'string' ? calendarEvent.location : '',
          details: typeof calendarEvent.details === 'string' ? calendarEvent.details : ''
        }));
      }
    }
  } catch {}

  seededTeamEvents.forEach((seededEvent) => {
    const eventIndex = calendarEvents.findIndex((calendarEvent) => calendarEvent.id === seededEvent.id);
    if (eventIndex === -1) calendarEvents.push(seededEvent);
    else calendarEvents[eventIndex] = { ...calendarEvents[eventIndex], ...seededEvent };
  });

  const makeTooltip = (id, events) => {
    const tooltip = makeElement('span', 'calendar-event-preview');
    tooltip.id = id;
    tooltip.setAttribute('role', 'tooltip');
    events.forEach((calendarEvent) => {
      const time = displayTime(calendarEvent.time, calendarEvent.endTime);
      tooltip.append(makeElement('strong', '', time ? `${time} · ${calendarEvent.title}` : calendarEvent.title));
    });
    return tooltip;
  };

  const makeExpandedDetails = (calendarEvent, dateKey, isYearView = false) => {
    const expanded = makeElement('div', isYearView ? 'calendar-year-event-details' : 'calendar-event-expanded');
    expanded.append(makeElement('strong', '', calendarEvent.title));
    expanded.append(makeElement('p', '', displayDate(dateKey)));
    if (calendarEvent.time) expanded.append(makeElement('p', '', `Time: ${displayTime(calendarEvent.time, calendarEvent.endTime)}`));
    if (calendarEvent.location) {
      const address = makeElement('address', '', calendarEvent.location);
      expanded.append(address);
    }
    if (calendarEvent.details) expanded.append(makeElement('p', '', calendarEvent.details));
    return expanded;
  };

  const renderMonthView = () => {
    const firstWeekday = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const todayKey = toDateKey(today);
    daysGrid.replaceChildren();
    daysGrid.setAttribute('aria-label', `${calendarPeriod.textContent} calendar dates`);

    for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
      const dayNumber = cellIndex - firstWeekday + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        const emptyDay = makeElement('span', 'calendar-day calendar-day-empty');
        emptyDay.setAttribute('aria-hidden', 'true');
        daysGrid.append(emptyDay);
        continue;
      }

      const dateKey = toDateKey(new Date(selectedYear, selectedMonth, dayNumber));
      const dayCell = makeElement('div', `calendar-day${dateKey === todayKey ? ' is-today' : ''}`);
      dayCell.append(makeElement('span', 'calendar-day-number', String(dayNumber)));
      const dayEvents = eventsForDate(dateKey);

      if (dayEvents.length) {
        const eventList = makeElement('div', 'calendar-day-events');
        dayEvents.forEach((calendarEvent, eventIndex) => {
          const eventDetails = makeElement('details', 'calendar-event-item');
          const eventSummary = makeElement('summary', `calendar-event ${calendarSeasonClass(selectedMonth)}`, calendarEvent.title);
          const tooltipId = `calendar-month-tooltip-${dayNumber}-${eventIndex}`;
          eventSummary.setAttribute('aria-label', `${calendarEvent.title}, ${displayDate(dateKey)}${calendarEvent.time ? ` at ${displayTime(calendarEvent.time, calendarEvent.endTime)}` : ''}. Expand for event details.`);
          eventSummary.setAttribute('aria-describedby', tooltipId);
          eventSummary.append(makeTooltip(tooltipId, [calendarEvent]));
          eventDetails.append(eventSummary, makeExpandedDetails(calendarEvent, dateKey));
          eventList.append(eventDetails);
        });
        dayCell.append(eventList);
      }

      daysGrid.append(dayCell);
    }
  };

  const renderYearView = () => {
    yearView.replaceChildren();
    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
      const monthArticle = makeElement('article', 'calendar-year-month');
      const monthTitle = makeElement('button', 'calendar-year-month-title', new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(selectedYear, monthIndex, 1)));
      monthTitle.type = 'button';
      monthTitle.setAttribute('aria-label', `View ${monthTitle.textContent} ${selectedYear}`);
      monthTitle.addEventListener('click', () => {
        selectedMonth = monthIndex;
        calendarView = 'month';
        renderCalendar();
      });
      monthArticle.append(monthTitle);

      const miniGrid = makeElement('div', 'calendar-mini-grid');
      const offset = new Date(selectedYear, monthIndex, 1).getDay();
      const dayCount = new Date(selectedYear, monthIndex + 1, 0).getDate();
      for (let blank = 0; blank < offset; blank += 1) miniGrid.append(makeElement('span', 'calendar-mini-empty'));

      for (let dayNumber = 1; dayNumber <= dayCount; dayNumber += 1) {
        const dateKey = toDateKey(new Date(selectedYear, monthIndex, dayNumber));
        const dayEvents = eventsForDate(dateKey);
        const dayCell = makeElement('div', `calendar-mini-day${dayEvents.length ? ' has-events' : ''}`);
        if (dayEvents.length) {
          const eventDetails = makeElement('details', 'calendar-year-event-item');
          const dateCircle = makeElement('summary', `calendar-year-date ${calendarSeasonClass(monthIndex)}`, String(dayNumber));
          const tooltipId = `calendar-year-tooltip-${monthIndex}-${dayNumber}`;
          dateCircle.setAttribute('aria-label', `${dayEvents.map((calendarEvent) => `${calendarEvent.title}${calendarEvent.time ? ` at ${displayTime(calendarEvent.time, calendarEvent.endTime)}` : ''}`).join('; ')} on ${displayDate(dateKey)}. Expand for details.`);
          dateCircle.setAttribute('aria-describedby', tooltipId);
          dateCircle.append(makeTooltip(tooltipId, dayEvents));
          const expanded = makeElement('div', 'calendar-year-expanded');
          dayEvents.forEach((calendarEvent) => expanded.append(makeExpandedDetails(calendarEvent, dateKey, true)));
          eventDetails.append(dateCircle, expanded);
          dayCell.append(eventDetails);
        } else {
          dayCell.append(makeElement('span', 'calendar-mini-day-number', String(dayNumber)));
        }
        miniGrid.append(dayCell);
      }

      monthArticle.append(miniGrid);
      yearView.append(monthArticle);
    }
  };

  const renderCalendar = () => {
    monthSelect.value = String(selectedMonth);
    const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(selectedYear, selectedMonth, 1));
    calendarPeriod.textContent = calendarView === 'year' ? String(selectedYear) : `${monthLabel} ${selectedYear}`;
    monthView.hidden = calendarView !== 'month';
    yearView.hidden = calendarView !== 'year';
    monthSelectWrap.hidden = calendarView === 'year';
    viewButtons.forEach((button) => {
      const isActive = button.dataset.calendarView === calendarView;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    const direction = calendarView === 'year' ? 'year' : 'month';
    previousButton.setAttribute('aria-label', `Previous ${direction}`);
    nextButton.setAttribute('aria-label', `Next ${direction}`);
    renderMonthView();
    renderYearView();
  };

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      calendarView = button.dataset.calendarView;
      renderCalendar();
    });
  });

  previousButton.addEventListener('click', () => {
    if (calendarView === 'year') selectedYear -= 1;
    else if (selectedMonth === 0) { selectedMonth = 11; selectedYear -= 1; }
    else selectedMonth -= 1;
    renderCalendar();
  });

  nextButton.addEventListener('click', () => {
    if (calendarView === 'year') selectedYear += 1;
    else if (selectedMonth === 11) { selectedMonth = 0; selectedYear += 1; }
    else selectedMonth += 1;
    renderCalendar();
  });

  monthSelect.addEventListener('change', () => {
    selectedMonth = Number(monthSelect.value);
    renderCalendar();
  });

  renderCalendar();
}
