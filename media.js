// Media Management System for Photos, Videos, and Presentations
// Uses localStorage to persist media data

class MediaManager {
    constructor() {
        this.photos = this.loadMedia('civicPhotos');
        this.videos = this.loadMedia('civicVideos');
        this.presentations = this.loadMedia('civicPresentations');
        this.currentEditId = null;
        this.currentMediaType = null;
        this.init();
    }

    init() {
        // DOM elements
        this.photoGallery = document.getElementById('photoGallery');
        this.videosGrid = document.getElementById('videosGrid');
        this.presentationsGrid = document.getElementById('presentationsGrid');

        this.modal = document.getElementById('mediaModal');
        this.mediaForm = document.getElementById('mediaForm');
        this.modalTitle = document.getElementById('mediaModalTitle');

        // Buttons
        this.addPhotoBtn = document.getElementById('addPhotoBtn');
        this.addVideoBtn = document.getElementById('addVideoBtn');
        this.addPresentationBtn = document.getElementById('addPresentationBtn');
        this.closeModalBtn = document.getElementById('closeMediaModal');
        this.cancelBtn = document.getElementById('cancelMediaBtn');

        // Form fields
        this.photoFields = document.getElementById('photoFields');
        this.videoFields = document.getElementById('videoFields');
        this.presentationFields = document.getElementById('presentationFields');

        // Event listeners
        this.addPhotoBtn.addEventListener('click', () => this.openAddModal('photo'));
        this.addVideoBtn.addEventListener('click', () => this.openAddModal('video'));
        this.addPresentationBtn.addEventListener('click', () => this.openAddModal('presentation'));
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        this.mediaForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Initial render
        this.renderPhotos();
        this.renderVideos();
        this.renderPresentations();
    }

    // Load media from localStorage
    loadMedia(key) {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    // Save media to localStorage
    saveMedia(type, data) {
        const key = type === 'photo' ? 'civicPhotos' :
                    type === 'video' ? 'civicVideos' : 'civicPresentations';
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Render Photos
    renderPhotos() {
        if (this.photos.length === 0) {
            this.photoGallery.innerHTML = `
                <div class="empty-media-state">
                    <p>📷 No photos yet. Click "Add Photo" to upload!</p>
                </div>
            `;
            return;
        }

        this.photoGallery.innerHTML = this.photos.map(photo => `
            <div class="gallery-item">
                <div class="gallery-image" style="background-image: url('${this.escapeHtml(photo.url)}');">
                    <div class="gallery-overlay">
                        <button class="btn-edit-media" data-id="${photo.id}" data-type="photo">Edit</button>
                        <button class="btn-delete-media" data-id="${photo.id}" data-type="photo">Delete</button>
                    </div>
                </div>
                <p class="gallery-caption">${this.escapeHtml(photo.caption)}</p>
            </div>
        `).join('');

        this.attachMediaEventListeners();
    }

    // Render Videos
    renderVideos() {
        if (this.videos.length === 0) {
            this.videosGrid.innerHTML = `
                <div class="empty-media-state">
                    <p>▶️ No videos yet. Click "Add Video" to upload!</p>
                </div>
            `;
            return;
        }

        this.videosGrid.innerHTML = this.videos.map(video => `
            <div class="video-item">
                <div class="video-embed">
                    ${this.getVideoEmbed(video.url)}
                </div>
                <div class="video-info">
                    <h4 class="video-title">${this.escapeHtml(video.title)}</h4>
                    <p class="video-desc">${this.escapeHtml(video.description)}</p>
                    <div class="video-actions">
                        <button class="btn-edit-media" data-id="${video.id}" data-type="video">Edit</button>
                        <button class="btn-delete-media" data-id="${video.id}" data-type="video">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.attachMediaEventListeners();
    }

    // Render Presentations
    renderPresentations() {
        if (this.presentations.length === 0) {
            this.presentationsGrid.innerHTML = `
                <div class="empty-media-state">
                    <p>📄 No presentations yet. Click "Add Presentation" to upload!</p>
                </div>
            `;
            return;
        }

        this.presentationsGrid.innerHTML = this.presentations.map(pres => `
            <div class="presentation-item">
                <div class="presentation-icon">📄</div>
                <div class="presentation-content">
                    <h4>${this.escapeHtml(pres.title)}</h4>
                    <p>${this.escapeHtml(pres.description)}</p>
                    <div class="presentation-meta">
                        <span>📅 ${this.escapeHtml(pres.date)}</span>
                        <span>📊 ${this.escapeHtml(pres.format)}</span>
                    </div>
                </div>
                <div class="presentation-actions">
                    <a href="${this.escapeHtml(pres.url)}" class="btn-download-presentation" target="_blank">Download</a>
                    <button class="btn-edit-media" data-id="${pres.id}" data-type="presentation">Edit</button>
                    <button class="btn-delete-media" data-id="${pres.id}" data-type="presentation">Delete</button>
                </div>
            </div>
        `).join('');

        this.attachMediaEventListeners();
    }

    // Get video embed HTML
    getVideoEmbed(url) {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(url);
            return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
        // Vimeo
        if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            return `<iframe width="100%" height="100%" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
        // Direct video file
        return `<video controls width="100%" height="100%"><source src="${this.escapeHtml(url)}"></video>`;
    }

    // Extract YouTube video ID
    extractYouTubeId(url) {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : '';
    }

    // Attach event listeners to edit/delete buttons
    attachMediaEventListeners() {
        document.querySelectorAll('.btn-edit-media').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const type = e.target.dataset.type;
                this.openEditModal(id, type);
            });
        });

        document.querySelectorAll('.btn-delete-media').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const type = e.target.dataset.type;
                this.deleteMedia(id, type);
            });
        });
    }

    // Open modal to add new media
    openAddModal(type) {
        this.currentEditId = null;
        this.currentMediaType = type;
        this.mediaForm.reset();

        // Hide all field groups
        this.photoFields.style.display = 'none';
        this.videoFields.style.display = 'none';
        this.presentationFields.style.display = 'none';

        // Show relevant fields
        if (type === 'photo') {
            this.modalTitle.textContent = 'Add New Photo';
            this.photoFields.style.display = 'block';
        } else if (type === 'video') {
            this.modalTitle.textContent = 'Add New Video';
            this.videoFields.style.display = 'block';
        } else if (type === 'presentation') {
            this.modalTitle.textContent = 'Add New Presentation';
            this.presentationFields.style.display = 'block';
        }

        this.modal.classList.add('active');
    }

    // Open modal to edit existing media
    openEditModal(id, type) {
        this.currentEditId = id;
        this.currentMediaType = type;

        // Hide all field groups
        this.photoFields.style.display = 'none';
        this.videoFields.style.display = 'none';
        this.presentationFields.style.display = 'none';

        if (type === 'photo') {
            this.modalTitle.textContent = 'Edit Photo';
            this.photoFields.style.display = 'block';
            const photo = this.photos.find(p => p.id === id);
            if (photo) {
                document.getElementById('photoUrl').value = photo.url;
                document.getElementById('photoCaption').value = photo.caption;
            }
        } else if (type === 'video') {
            this.modalTitle.textContent = 'Edit Video';
            this.videoFields.style.display = 'block';
            const video = this.videos.find(v => v.id === id);
            if (video) {
                document.getElementById('videoUrl').value = video.url;
                document.getElementById('videoTitle').value = video.title;
                document.getElementById('videoDescription').value = video.description;
            }
        } else if (type === 'presentation') {
            this.modalTitle.textContent = 'Edit Presentation';
            this.presentationFields.style.display = 'block';
            const pres = this.presentations.find(p => p.id === id);
            if (pres) {
                document.getElementById('presentationUrl').value = pres.url;
                document.getElementById('presentationTitle').value = pres.title;
                document.getElementById('presentationDescription').value = pres.description;
                document.getElementById('presentationDate').value = pres.date;
                document.getElementById('presentationFormat').value = pres.format;
            }
        }

        this.modal.classList.add('active');
    }

    // Close modal
    closeModal() {
        this.modal.classList.remove('active');
        this.mediaForm.reset();
        this.currentEditId = null;
        this.currentMediaType = null;
    }

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();

        if (this.currentMediaType === 'photo') {
            const photoData = {
                id: this.currentEditId || Date.now(),
                url: document.getElementById('photoUrl').value,
                caption: document.getElementById('photoCaption').value
            };

            if (this.currentEditId) {
                const index = this.photos.findIndex(p => p.id === this.currentEditId);
                if (index !== -1) this.photos[index] = photoData;
            } else {
                this.photos.push(photoData);
            }

            this.saveMedia('photo', this.photos);
            this.renderPhotos();

        } else if (this.currentMediaType === 'video') {
            const videoData = {
                id: this.currentEditId || Date.now(),
                url: document.getElementById('videoUrl').value,
                title: document.getElementById('videoTitle').value,
                description: document.getElementById('videoDescription').value
            };

            if (this.currentEditId) {
                const index = this.videos.findIndex(v => v.id === this.currentEditId);
                if (index !== -1) this.videos[index] = videoData;
            } else {
                this.videos.push(videoData);
            }

            this.saveMedia('video', this.videos);
            this.renderVideos();

        } else if (this.currentMediaType === 'presentation') {
            const presData = {
                id: this.currentEditId || Date.now(),
                url: document.getElementById('presentationUrl').value,
                title: document.getElementById('presentationTitle').value,
                description: document.getElementById('presentationDescription').value,
                date: document.getElementById('presentationDate').value,
                format: document.getElementById('presentationFormat').value
            };

            if (this.currentEditId) {
                const index = this.presentations.findIndex(p => p.id === this.currentEditId);
                if (index !== -1) this.presentations[index] = presData;
            } else {
                this.presentations.push(presData);
            }

            this.saveMedia('presentation', this.presentations);
            this.renderPresentations();
        }

        this.closeModal();
    }

    // Delete media
    deleteMedia(id, type) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        if (type === 'photo') {
            this.photos = this.photos.filter(p => p.id !== id);
            this.saveMedia('photo', this.photos);
            this.renderPhotos();
        } else if (type === 'video') {
            this.videos = this.videos.filter(v => v.id !== id);
            this.saveMedia('video', this.videos);
            this.renderVideos();
        } else if (type === 'presentation') {
            this.presentations = this.presentations.filter(p => p.id !== id);
            this.saveMedia('presentation', this.presentations);
            this.renderPresentations();
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MediaManager();
});
