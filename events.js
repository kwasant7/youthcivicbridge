// Events Management System
// Uses localStorage to persist events data

class EventsManager {
    constructor() {
        this.events = this.loadEvents();
        this.currentEditId = null;
        this.init();
    }

    init() {
        // DOM elements
        this.eventsBoard = document.getElementById('eventsBoard');
        this.emptyState = document.getElementById('emptyState');
        this.modal = document.getElementById('eventModal');
        this.eventForm = document.getElementById('eventForm');
        this.modalTitle = document.getElementById('modalTitle');

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

        // Initial render
        this.renderEvents();
    }

    // Load events from localStorage
    loadEvents() {
        const stored = localStorage.getItem('civicEvents');
        if (stored) {
            return JSON.parse(stored);
        }
        // Default sample events
        return [
            {
                id: Date.now(),
                title: 'Youth Town Hall Meeting',
                date: '2025-11-15',
                time: '18:00',
                location: 'City Hall Auditorium',
                description: 'Join local government leaders to discuss issues affecting young people in our community.',
                category: 'Advocacy'
            },
            {
                id: Date.now() + 1,
                title: 'Environmental Action Day',
                date: '2025-11-18',
                time: '09:00',
                location: 'Central Park',
                description: 'Join us for a day of environmental action! We\'ll be planting trees and cleaning up litter.',
                category: 'Volunteering'
            }
        ];
    }

    // Save events to localStorage
    saveEvents() {
        localStorage.setItem('civicEvents', JSON.stringify(this.events));
    }

    // Render all events
    renderEvents() {
        if (this.events.length === 0) {
            this.eventsBoard.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.eventsBoard.style.display = 'flex';
        this.emptyState.style.display = 'none';

        // Sort events by date (newest first)
        const sortedEvents = [...this.events].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        this.eventsBoard.innerHTML = sortedEvents.map(event => this.createEventHTML(event)).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.openEditModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
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

        return `
            <div class="event-item">
                <div class="event-content">
                    <div class="event-header-row">
                        <h3>${this.escapeHtml(event.title)}</h3>
                        <span class="event-category">${event.category}</span>
                    </div>
                    <div class="event-info">
                        <span class="event-info-item">📅 ${formattedDate}</span>
                        <span class="event-info-item">⏰ ${formattedTime}</span>
                        <span class="event-info-item">📍 ${this.escapeHtml(event.location)}</span>
                    </div>
                    <p class="event-description">${this.escapeHtml(event.description)}</p>
                </div>
                <div class="event-actions">
                    <button class="btn-edit" data-id="${event.id}">Edit</button>
                    <button class="btn-delete" data-id="${event.id}">Delete</button>
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
    handleSubmit(e) {
        e.preventDefault();

        // Combine hour and minute to create time
        const hour = document.getElementById('eventHour').value;
        const minute = document.getElementById('eventMinute').value;
        const time = `${hour}:${minute}`;

        const eventData = {
            id: this.currentEditId || Date.now(),
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: time,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            category: document.getElementById('eventCategory').value
        };

        if (this.currentEditId) {
            // Update existing event
            const index = this.events.findIndex(e => e.id === this.currentEditId);
            if (index !== -1) {
                this.events[index] = eventData;
            }
        } else {
            // Add new event
            this.events.push(eventData);
        }

        this.saveEvents();
        this.renderEvents();
        this.closeModal();
    }

    // Delete event
    deleteEvent(id) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== id);
            this.saveEvents();
            this.renderEvents();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EventsManager();
});
