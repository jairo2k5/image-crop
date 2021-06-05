const photoFile = document.getElementById('photo-file');
let photoPreview = document.getElementById('photo-preview');
let image;
let photoName;

/* Select & Preview image */
document.getElementById('select-image').onclick = () => {
    photoFile.click();
}

window.addEventListener('DOMContentLoaded', () => {
    photoFile.addEventListener('change', () => {
        let file = photoFile.files.item(0);
        photoName = file.name;
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            image = new Image();
            image.src = event.target.result;
            image.onload = onloadImage;
        }
    });
});

/* Selection tool */
const selection = document.getElementById('selection-tool');
let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY;
let startSelection = false;
const events = {
    mouseover() {
        this.style.cursor = 'crosshair';
    },
    mousedown() {
        const { clientX, clientY, offsetX, offsetY } = event;
        //console.table({
        //    'client': [clientX, clientY],
        //    'offset': [offsetX, offsetY],
        // });
        startX = clientX;
        startY = clientY;
        relativeStartX = offsetX;
        relativeStartY = offsetY;
        startSelection = true;
    },
    mousemove() {
        endX = event.clientX;
        endY = event.clientY;
        if (startSelection) {
            selection.style.display = 'initial';
            selection.style.top = startY + 'px';
            selection.style.left = startX + 'px';
            selection.style.width = (endX - startX) + 'px';
            selection.style.height = (endY - startY) + 'px';
        }
    },
    mouseup() {
        startSelection = false;
        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        /* Show crop button */
        cropButton.style.display = 'initial';
    }
};

Object.keys(events).forEach(eventName => {
    photoPreview.addEventListener(eventName, events[eventName]);
});

/* Canvas */
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

const onloadImage = () => {
    const { width, height } = image;
    canvas.width = width;
    canvas.height = height;

    // Clear context
    ctx.clearRect(0, 0, width, height);

    // Draw the image in context
    ctx.drawImage(image, 0, 0);
    photoPreview.src = canvas.toDataURL();
}

/* Crop image */
const cropButton = document.getElementById('crop-image');

cropButton.onclick = () => {
    const { width: imgW, height: imgH } = image;
    const { width: previewW, height: previewH } = photoPreview;
    const [factorWidth, factorHeight] = [
        +(imgW / previewW),
        +(imgH / previewH)
    ];
    const [selectionWidth, selectionHeight] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ];
    const [croppedWidth, croppedHeight] = [
        +(selectionWidth * factorWidth),
        +(selectionHeight * factorHeight)
    ];
    const [actualX, actualY] = [
        +(relativeStartX * factorWidth),
        +(relativeStartY * factorHeight)
    ];

    /* Get context cropped image */
    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight);

    /* Clear canvas context */
    ctx.clearRect(0, 0, ctx.width, ctx.height);

    /* Adjustment of proportions */
    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight;

    /* Add cropped image at context */
    ctx.putImageData(croppedImage, 0, 0);

    /* Hiding Selection Tool */
    selection.style.display = 'none';

    /* Update image preview */
    photoPreview.src = canvas.toDataURL();

    /* Download button */
    downloadButton.style.display = 'initial';
}

/* Download */
const downloadButton = document.getElementById('download');

downloadButton.onclick = () => {
    const a = document.createElement('a');
    a.download = photoName = '-cropped.png';
    a.href = canvas.toDataURL();
    a.click();
}