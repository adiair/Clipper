let originalFile = null;
let compressedBlob = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewSection = document.getElementById('previewSection');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const originalImg = document.getElementById('originalImg');
const compressedImg = document.getElementById('compressedImg');
const originalInfo = document.getElementById('originalInfo');
const compressedInfo = document.getElementById('compressedInfo');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Upload area interactions
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

// Quality slider
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value + '%';
    if (originalFile) {
        compressImage(originalFile, e.target.value / 100);
    }
});

// Download button
downloadBtn.addEventListener('click', downloadImage);

// Reset button
resetBtn.addEventListener('click', resetApp);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    }
}

function processFile(file) {
    originalFile = file;

    // Show controls and preview
    controls.style.display = 'block';
    previewSection.style.display = 'grid';
    resetBtn.style.display = 'inline-block';

    // Display original image
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImg.src = e.target.result;
        displayFileInfo(file, originalInfo);
    };
    reader.readAsDataURL(file);

    // Compress image
    compressImage(file, qualitySlider.value / 100);
}

function compressImage(file, quality) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to compressed blob
        canvas.toBlob((blob) => {
            compressedBlob = blob;

            // Display compressed image
            const url = URL.createObjectURL(blob);
            compressedImg.src = url;

            // Create file-like object for info display
            const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            displayFileInfo(compressedFile, compressedInfo, file.size);
        }, 'image/jpeg', quality);
    };

    const reader = new FileReader();
    reader.onload = (e) => img.src = e.target.result;
    reader.readAsDataURL(file);
}

function displayFileInfo(file, infoElement, originalSize = null) {
    const size = formatFileSize(file.size);
    let html = `
                <div class="info-row">
                    <span>📄 Name:</span>
                    <span>${file.name}</span>
                </div>
                <div class="info-row">
                    <span>📏 Size:</span>
                    <span>${size}</span>
                </div>
                <div class="info-row">
                    <span>📅 Type:</span>
                    <span>${file.type}</span>
                </div>
            `;

    if (originalSize) {
        const reduction = ((originalSize - file.size) / originalSize * 100).toFixed(1);
        html += `
                    <div class="info-row">
                        <span>💾 Saved:</span>
                        <span>(${reduction}%)</span>
                    </div>
                `;
    }

    infoElement.innerHTML = html;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadImage() {
    if (compressedBlob) {
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${originalFile.name.split('.')[0]}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

function resetApp() {
    originalFile = null;
    compressedBlob = null;
    controls.style.display = 'none';
    previewSection.style.display = 'none';
    resetBtn.style.display = 'none';
    fileInput.value = '';
    qualitySlider.value = 80;
    qualityValue.textContent = '80%';
}