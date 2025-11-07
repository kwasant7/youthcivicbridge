// Events Management System
// Uses Firebase Firestore to persist events data

class EventsManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentEditId = null;
        this.eventsCollection = db.collection('events');
        this.unsubscribe = null;

        // View state
        this.currentView = 'list'; // 'list' or 'calendar'
        this.currentDate = new Date();

        // Filter state
        this.filters = {
            search: '',
            category: 'all',
            date: 'all',
            sort: 'date-desc'
        };

        this.init();
    }

    init() {
        // DOM elements
        this.eventsBoard = document.getElementById('eventsBoard');
        this.emptyState = document.getElementById('emptyState');
        this.modal = document.getElementById('eventModal');
        this.eventForm = document.getElementById('eventForm');
        this.modalTitle = document.getElementById('modalTitle');

        // Calendar elements
        this.calendarView = document.getElementById('calendarView');
        this.calendarGrid = document.getElementById('calendarGrid');
        this.calendarMonthTitle = document.getElementById('calendarMonthTitle');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');

        // View toggle buttons
        this.listViewBtn = document.getElementById('listViewBtn');
        this.calendarViewBtn = document.getElementById('calendarViewBtn');

        // Filter elements
        this.searchInput = document.getElementById('searchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.dateFilter = document.getElementById('dateFilter');
        this.sortBy = document.getElementById('sortBy');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.eventCount = document.getElementById('eventCount');

        // Buttons
        this.addEventBtn = document.getElementById('addEventBtn');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');

        // Event listeners
        this.addEventBtn.addEventListener('click', () => this.openAddModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        this.eventForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // View toggle listeners
        this.listViewBtn.addEventListener('click', () => this.switchView('list'));
        this.calendarViewBtn.addEventListener('click', () => this.switchView('calendar'));

        // Calendar navigation listeners
        this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));

        // Filter event listeners
        this.searchInput.addEventListener('input', () => this.handleFilterChange());
        this.categoryFilter.addEventListener('change', () => this.handleFilterChange());
        this.dateFilter.addEventListener('change', () => this.handleFilterChange());
        this.sortBy.addEventListener('change', () => this.handleFilterChange());
        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());

        // Load events from Firestore with real-time updates
        this.loadEvents();
    }

    // Load events from Firestore with real-time listener
    loadEvents() {
        this.unsubscribe = this.eventsCollection.onSnapshot((snapshot) => {
            if (snapshot.empty) {
                // Initialize with sample events if collection is empty
                this.initializeSampleEvents();
            } else {
                this.events = [];
                snapshot.forEach((doc) => {
                    this.events.push({
                        docId: doc.id,
                        ...doc.data()
                    });
                });
                this.renderEvents();
            }
        }, (error) => {
            console.error('Error loading events:', error);
            alert('Failed to load events. Please check your Firebase configuration.');
        });
    }

    // Initialize sample events (only if collection is empty)
    async initializeSampleEvents() {
        const sampleEvents = [
            {
                id: Date.now().toString(),
                title: 'Youth Town Hall Meeting',
                date: '2025-11-15',
                time: '18:00',
                location: 'City Hall Auditorium',
                description: 'Join local government leaders to discuss issues affecting young people in our community.',
                category: 'Advocacy',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                id: (Date.now() + 1).toString(),
                title: 'Environmental Action Day',
                date: '2025-11-18',
                time: '09:00',
                location: 'Central Park',
                description: 'Join us for a day of environmental action! We\'ll be planting trees and cleaning up litter.',
                category: 'Volunteering',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];

        try {
            const batch = db.batch();
            sampleEvents.forEach(event => {
                const docRef = this.eventsCollection.doc(event.id);
                batch.set(docRef, event);
            });
            await batch.commit();
            console.log('Sample events initialized');
        } catch (error) {
            console.error('Error initializing sample events:', error);
        }
    }

    // Handle filter changes
    handleFilterChange() {
        this.filters.search = this.searchInput.value.toLowerCase();
        this.filters.category = this.categoryFilter.value;
        this.filters.date = this.dateFilter.value;
        this.filters.sort = this.sortBy.value;
        this.applyFilters();
    }

    // Clear all filters
    clearFilters() {
        this.searchInput.value = '';
        this.categoryFilter.value = 'all';
        this.dateFilter.value = 'all';
        this.sortBy.value = 'date-desc';
        this.handleFilterChange();
    }

    // Apply filters and render
    applyFilters() {
        let filtered = [...this.events];

        // Apply search filter
        if (this.filters.search) {
            filtered = filtered.filter(event => {
                const searchText = this.filters.search;
                return event.title.toLowerCase().includes(searchText) ||
                       event.description.toLowerCase().includes(searchText) ||
                       event.location.toLowerCase().includes(searchText);
            });
        }

        // Apply category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(event => event.category === this.filters.category);
        }

        // Apply date filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (this.filters.date === 'upcoming') {
            filtered = filtered.filter(event => new Date(event.date) >= today);
        } else if (this.filters.date === 'past') {
            filtered = filtered.filter(event => new Date(event.date) < today);
        }

        // Apply sorting
        filtered = this.sortEvents(filtered, this.filters.sort);

        this.filteredEvents = filtered;
        this.renderEvents();
    }

    // Sort events based on criteria
    sortEvents(events, sortBy) {
        const sorted = [...events];

        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'title-asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'title-desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return sorted;
        }
    }

    // Render all events
    renderEvents() {
        const eventsToRender = this.filteredEvents.length > 0 || this.filters.search ||
                               this.filters.category !== 'all' || this.filters.date !== 'all'
                               ? this.filteredEvents : this.events;

        // Update count
        this.eventCount.textContent = eventsToRender.length;

        if (eventsToRender.length === 0) {
            this.eventsBoard.style.display = 'none';
            this.emptyState.style.display = 'block';

            // Update empty state message based on filters
            const emptyTitle = document.getElementById('emptyStateTitle');
            const emptyMessage = document.getElementById('emptyStateMessage');

            if (this.events.length === 0) {
                emptyTitle.textContent = 'No Events Yet';
                emptyMessage.textContent = 'Click "Add New Event" to create your first event!';
            } else {
                emptyTitle.textContent = 'No Events Found';
                emptyMessage.textContent = 'Try adjusting your filters or search terms.';
            }
            return;
        }

        this.eventsBoard.style.display = 'flex';
        this.emptyState.style.display = 'none';

        this.eventsBoard.innerHTML = eventsToRender.map(event => this.createEventHTML(event)).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.openEditModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deleteEvent(id);
            });
        });
    }

    // Create HTML for a single event
    createEventHTML(event) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const formattedTime = this.formatTime(event.time);

        // Determine if event is past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = eventDate < today;
        const pastClass = isPast ? 'event-past' : '';

        // Get category color
        const categoryColors = {
            'Community': '#667eea',
            'Education': '#f59e0b',
            'Advocacy': '#ef4444',
            'Volunteering': '#10b981',
            'Workshop': '#8b5cf6',
            'Social': '#ec4899'
        };
        const categoryColor = categoryColors[event.category] || '#667eea';

        return `
            <div class="event-item ${pastClass}">
                <div class="event-date-badge" style="background: ${categoryColor}">
                    <div class="date-day">${eventDate.getDate()}</div>
                    <div class="date-month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
                <div class="event-content">
                    <div class="event-header-row">
                        <h3>${this.escapeHtml(event.title)}</h3>
                        <span class="event-category" style="background: ${categoryColor}20; color: ${categoryColor}; border-color: ${categoryColor}">
                            ${event.category}
                        </span>
                    </div>
                    <div class="event-info">
                        <span class="event-info-item">
                            <span class="info-icon">⏰</span>
                            <span>${formattedTime}</span>
                        </span>
                        <span class="event-info-item">
                            <span class="info-icon">📍</span>
                            <span>${this.escapeHtml(event.location)}</span>
                        </span>
                    </div>
                    <p class="event-description">${this.escapeHtml(event.description)}</p>
                    ${isPast ? '<div class="event-past-label">Past Event</div>' : ''}
                </div>
                <div class="event-actions">
                    <button class="btn-edit" data-id="${event.id}" title="Edit Event">✏️</button>
                    <button class="btn-delete" data-id="${event.id}" title="Delete Event">🗑️</button>
                </div>
            </div>
        `;
    }

    // Format time from 24h to 12h format
    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Open modal to add new event
    openAddModal() {
        this.currentEditId = null;
        this.modalTitle.textContent = 'Add New Event';
        this.eventForm.reset();
        this.modal.classList.add('active');
    }

    // Open modal to edit existing event
    openEditModal(id) {
        this.currentEditId = id;
        this.modalTitle.textContent = 'Edit Event';

        const event = this.events.find(e => e.id === id);
        if (event) {
            document.getElementById('eventId').value = event.id;
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDate').value = event.date;

            // Split time into hour and minute
            const [hour, minute] = event.time.split(':');
            document.getElementById('eventHour').value = hour;
            document.getElementById('eventMinute').value = minute;

            document.getElementById('eventLocation').value = event.location;
            document.getElementById('eventDescription').value = event.description;
            document.getElementById('eventCategory').value = event.category;
        }

        this.modal.classList.add('active');
    }

    // Close modal
    closeModal() {
        this.modal.classList.remove('active');
        this.eventForm.reset();
        this.currentEditId = null;
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();

        // Combine hour and minute to create time
        const hour = document.getElementById('eventHour').value;
        const minute = document.getElementById('eventMinute').value;
        const time = `${hour}:${minute}`;

        const eventData = {
            id: this.currentEditId || Date.now().toString(),
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: time,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            category: document.getElementById('eventCategory').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (this.currentEditId) {
                // Update existing event
                const event = this.events.find(e => e.id === this.currentEditId);
                if (event && event.docId) {
                    await this.eventsCollection.doc(event.docId).update(eventData);
                    console.log('Event updated successfully');
                }
            } else {
                // Add new event
                eventData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await this.eventsCollection.doc(eventData.id).set(eventData);
                console.log('Event added successfully');
            }
            this.closeModal();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event. Please try again.');
        }
    }

    // Delete event
    async deleteEvent(id) {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                const event = this.events.find(e => e.id === id);
                if (event && event.docId) {
                    await this.eventsCollection.doc(event.docId).delete();
                    console.log('Event deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Failed to delete event. Please try again.');
            }
        }
    }

    // Switch between list and calendar view
    switchView(view) {
        this.currentView = view;

        if (view === 'list') {
            this.eventsBoard.style.display = 'flex';
            this.calendarView.style.display = 'none';
            this.listViewBtn.classList.add('active');
            this.calendarViewBtn.classList.remove('active');
            this.renderEvents();
        } else {
            this.eventsBoard.style.display = 'none';
            this.calendarView.style.display = 'block';
            this.listViewBtn.classList.remove('active');
            this.calendarViewBtn.classList.add('active');
            this.renderCalendar();
        }
    }

    // Navigate months in calendar view
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    // Render calendar view
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month title
        this.calendarMonthTitle.textContent = new Date(year, month, 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Build calendar HTML
        let calendarHTML = '<div class="calendar-weekdays">';
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            calendarHTML += `<div class="calendar-weekday">${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar-days">';

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = this.getEventsForDate(dateStr);
            const isToday = this.isToday(year, month, day);
            const todayClass = isToday ? 'today' : '';

            calendarHTML += `<div class="calendar-day ${todayClass}" data-date="${dateStr}">
                <div class="day-number">${day}</div>`;

            if (dayEvents.length > 0) {
                calendarHTML += '<div class="day-events">';
                dayEvents.slice(0, 3).forEach(event => {
                    const categoryColors = {
                        'Community': '#667eea',
                        'Education': '#f59e0b',
                        'Advocacy': '#ef4444',
                        'Volunteering': '#10b981',
                        'Workshop': '#8b5cf6',
                        'Social': '#ec4899'
                    };
                    const color = categoryColors[event.category] || '#667eea';
                    calendarHTML += `
                        <div class="calendar-event" style="background: ${color}" title="${this.escapeHtml(event.title)} - ${this.formatTime(event.time)}">
                            ${this.escapeHtml(event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title)}
                        </div>`;
                });
                if (dayEvents.length > 3) {
                    calendarHTML += `<div class="more-events">+${dayEvents.length - 3} more</div>`;
                }
                calendarHTML += '</div>';
            }

            calendarHTML += '</div>';
        }

        // Next month days
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let day = 1; day <= remainingCells; day++) {
                calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
            }
        }

        calendarHTML += '</div>';
        this.calendarGrid.innerHTML = calendarHTML;

        // Add click listeners to calendar days
        document.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                const date = dayEl.dataset.date;
                if (date) {
                    this.showDayEvents(date);
                }
            });
        });
    }

    // Get events for a specific date
    getEventsForDate(dateStr) {
        return this.events.filter(event => event.date === dateStr);
    }

    // Check if date is today
    isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year &&
               today.getMonth() === month &&
               today.getDate() === day;
    }

    // Show events for a specific day
    showDayEvents(dateStr) {
        const dayEvents = this.getEventsForDate(dateStr);
        if (dayEvents.length === 0) return;

        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        let eventsList = dayEvents.map(event => `
            <div class="day-event-item">
                <strong>${this.escapeHtml(event.title)}</strong><br>
                <span>⏰ ${this.formatTime(event.time)}</span><br>
                <span>📍 ${this.escapeHtml(event.location)}</span><br>
                <span class="event-cat">${event.category}</span>
            </div>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'day-events-modal';
        modal.innerHTML = `
            <div class="day-events-content">
                <div class="day-events-header">
                    <h3>${formattedDate}</h3>
                    <button class="close-day-modal">&times;</button>
                </div>
                <div class="day-events-list">
                    ${eventsList}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        modal.querySelector('.close-day-modal').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EventsManager();
});
