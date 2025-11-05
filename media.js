// Media Management System for Photos, Videos, and Presentations
// Uses Firebase Firestore to persist media data

class MediaManager {
    constructor() {
        this.photos = [];
        this.videos = [];
        this.presentations = [];
        this.currentEditId = null;
        this.currentMediaType = null;

        // Firestore collections
        this.photosCollection = db.collection('photos');
        this.videosCollection = db.collection('videos');
        this.presentationsCollection = db.collection('presentations');

        // Unsubscribe functions for real-time listeners
        this.unsubscribePhotos = null;
        this.unsubscribeVideos = null;
        this.unsubscribePresentations = null;

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

        // Load media from Firestore with real-time listeners
        this.loadPhotos();
        this.loadVideos();
        this.loadPresentations();
    }

    // Load photos from Firestore with real-time listener
    loadPhotos() {
        this.unsubscribePhotos = this.photosCollection.onSnapshot((snapshot) => {
            this.photos = [];
            snapshot.forEach((doc) => {
                this.photos.push({
                    docId: doc.id,
                    ...doc.data()
                });
            });
            this.renderPhotos();
        }, (error) => {
            console.error('Error loading photos:', error);
        });
    }

    // Load videos from Firestore with real-time listener
    loadVideos() {
        this.unsubscribeVideos = this.videosCollection.onSnapshot((snapshot) => {
            this.videos = [];
            snapshot.forEach((doc) => {
                this.videos.push({
                    docId: doc.id,
                    ...doc.data()
                });
            });
            this.renderVideos();
        }, (error) => {
            console.error('Error loading videos:', error);
        });
    }

    // Load presentations from Firestore with real-time listener
    loadPresentations() {
        this.unsubscribePresentations = this.presentationsCollection.onSnapshot((snapshot) => {
            this.presentations = [];
            snapshot.forEach((doc) => {
                this.presentations.push({
                    docId: doc.id,
                    ...doc.data()
                });
            });
            this.renderPresentations();
        }, (error) => {
            console.error('Error loading presentations:', error);
        });
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
                    <a href="${this.escapeHtml(pres.url)}" class="btn-download-presentation" target="_blank">View/Download</a>
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
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                this.openEditModal(id, type);
            });
        });

        document.querySelectorAll('.btn-delete-media').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                this.deleteMedia(id, type);
            });
        });
    }

    // Open modal to add new media
    openAddModal(type) {
        console.log('=== OPENING ADD MODAL ===');
        console.log('Type:', type);

        this.currentEditId = null;
        this.currentMediaType = type;
        this.mediaForm.reset();

        console.log('Current media type set to:', this.currentMediaType);

        // Hide all field groups and disable their required fields
        this.photoFields.style.display = 'none';
        this.videoFields.style.display = 'none';
        this.presentationFields.style.display = 'none';

        // Disable required on all fields first
        document.getElementById('photoUrl').required = false;
        document.getElementById('photoCaption').required = false;
        document.getElementById('videoUrl').required = false;
        document.getElementById('videoTitle').required = false;
        document.getElementById('videoDescription').required = false;
        document.getElementById('presentationUrl').required = false;
        document.getElementById('presentationTitle').required = false;
        document.getElementById('presentationDescription').required = false;
        document.getElementById('presentationDate').required = false;
        document.getElementById('presentationFormat').required = false;

        // Show relevant fields and enable their required attributes
        if (type === 'photo') {
            this.modalTitle.textContent = 'Add New Photo';
            this.photoFields.style.display = 'block';
            document.getElementById('photoUrl').required = true;
            document.getElementById('photoCaption').required = true;
            console.log('Photo fields displayed');
        } else if (type === 'video') {
            this.modalTitle.textContent = 'Add New Video';
            this.videoFields.style.display = 'block';
            document.getElementById('videoUrl').required = true;
            document.getElementById('videoTitle').required = true;
            document.getElementById('videoDescription').required = true;
            console.log('Video fields displayed');
        } else if (type === 'presentation') {
            this.modalTitle.textContent = 'Add New Presentation';
            this.presentationFields.style.display = 'block';
            document.getElementById('presentationUrl').required = true;
            document.getElementById('presentationTitle').required = true;
            document.getElementById('presentationDescription').required = true;
            document.getElementById('presentationDate').required = true;
            document.getElementById('presentationFormat').required = true;
            console.log('Presentation fields displayed');
        }

        this.modal.classList.add('active');
        console.log('Modal opened');
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

    // Convert various image URLs to direct image URLs
    convertToDirectImageUrl(url) {
        if (!url) return url;

        // Imgur conversions
        // https://imgur.com/abc123 -> https://i.imgur.com/abc123.jpg
        // https://imgur.com/a/abc123 -> https://i.imgur.com/abc123.jpg
        if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
            const imgurMatch = url.match(/imgur\.com\/(?:a\/)?([a-zA-Z0-9]+)/);
            if (imgurMatch) {
                const imageId = imgurMatch[1];
                // Try common extensions
                return `https://i.imgur.com/${imageId}.jpg`;
            }
        }

        // Google Drive conversions
        // https://drive.google.com/file/d/FILE_ID/view -> direct link
        if (url.includes('drive.google.com/file/d/')) {
            const driveMatch = url.match(/\/file\/d\/([^\/]+)/);
            if (driveMatch) {
                const fileId = driveMatch[1];
                return `https://drive.google.com/uc?export=view&id=${fileId}`;
            }
        }

        return url;
    }

    // Convert presentation URLs to viewable/downloadable format
    convertPresentationUrl(url) {
        if (!url) return url;

        // Google Slides conversions - keep original for viewing
        // User can view in browser and download from there
        if (url.includes('docs.google.com/presentation')) {
            const slideMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
            if (slideMatch) {
                const fileId = slideMatch[1];
                // Use preview mode - works better for public access
                return `https://docs.google.com/presentation/d/${fileId}/preview`;
            }
        }

        // Google Drive presentation link - convert to preview
        if (url.includes('drive.google.com/file/d/')) {
            const driveMatch = url.match(/\/file\/d\/([^\/]+)/);
            if (driveMatch) {
                const fileId = driveMatch[1];
                // Use preview mode instead of download
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }

        return url;
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();

        console.log('=== FORM SUBMIT TRIGGERED ===');
        console.log('Current media type:', this.currentMediaType);

        try {
            if (this.currentMediaType === 'photo') {
                let photoUrl = document.getElementById('photoUrl').value;

                // Convert to direct image URL if needed
                photoUrl = this.convertToDirectImageUrl(photoUrl);

                const photoData = {
                    id: this.currentEditId || Date.now().toString(),
                    url: photoUrl,
                    caption: document.getElementById('photoCaption').value,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (this.currentEditId) {
                    const photo = this.photos.find(p => p.id === this.currentEditId);
                    if (photo && photo.docId) {
                        await this.photosCollection.doc(photo.docId).update(photoData);
                    }
                } else {
                    photoData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await this.photosCollection.doc(photoData.id).set(photoData);
                }

            } else if (this.currentMediaType === 'video') {
                const videoData = {
                    id: this.currentEditId || Date.now().toString(),
                    url: document.getElementById('videoUrl').value,
                    title: document.getElementById('videoTitle').value,
                    description: document.getElementById('videoDescription').value,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (this.currentEditId) {
                    const video = this.videos.find(v => v.id === this.currentEditId);
                    if (video && video.docId) {
                        await this.videosCollection.doc(video.docId).update(videoData);
                    }
                } else {
                    videoData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await this.videosCollection.doc(videoData.id).set(videoData);
                }

            } else if (this.currentMediaType === 'presentation') {
                let presUrl = document.getElementById('presentationUrl').value;

                console.log('Original presentation URL:', presUrl);

                // Convert to downloadable presentation URL if needed
                presUrl = this.convertPresentationUrl(presUrl);

                console.log('Converted presentation URL:', presUrl);

                const presData = {
                    id: this.currentEditId || Date.now().toString(),
                    url: presUrl,
                    title: document.getElementById('presentationTitle').value,
                    description: document.getElementById('presentationDescription').value,
                    date: document.getElementById('presentationDate').value,
                    format: document.getElementById('presentationFormat').value,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                console.log('Saving presentation data:', presData);

                if (this.currentEditId) {
                    const pres = this.presentations.find(p => p.id === this.currentEditId);
                    if (pres && pres.docId) {
                        await this.presentationsCollection.doc(pres.docId).update(presData);
                    }
                } else {
                    presData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await this.presentationsCollection.doc(presData.id).set(presData);
                }

                console.log('Presentation saved successfully!');
            }

            this.closeModal();
        } catch (error) {
            console.error('Error saving media:', error);
            console.error('Error details:', error.message, error.stack);
            alert('Failed to save. Please try again. Check console for details.');
        }
    }

    // Delete media
    async deleteMedia(id, type) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            if (type === 'photo') {
                const photo = this.photos.find(p => p.id === id);
                if (photo && photo.docId) {
                    await this.photosCollection.doc(photo.docId).delete();
                }
            } else if (type === 'video') {
                const video = this.videos.find(v => v.id === id);
                if (video && video.docId) {
                    await this.videosCollection.doc(video.docId).delete();
                }
            } else if (type === 'presentation') {
                const pres = this.presentations.find(p => p.id === id);
                if (pres && pres.docId) {
                    await this.presentationsCollection.doc(pres.docId).delete();
                }
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('Failed to delete. Please try again.');
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
