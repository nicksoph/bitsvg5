const fileInput = document.getElementById('fileInput');
const svgContainer = document.getElementById('svgContainer');
const saveButton = document.getElementById('saveButton');

let svg = null;
let isDragging = false;
let startX, startY, originalX, originalY;
let scale = 1;

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            svgContainer.innerHTML = e.target.result;
            svg = svgContainer.querySelector('svg');
            makeSVGInteractive();
        };
        reader.readAsText(file);
    }
});

function makeSVGInteractive() {
    const viewBox = svg.getAttribute('viewBox');
    const [minX, minY, width, height] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 100, 100];
    const aspectRatio = width / height;

    const containerWidth = svgContainer.clientWidth;
    const containerHeight = svgContainer.clientHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let svgWidth, svgHeight;
    if (aspectRatio > containerAspectRatio) {
        svgWidth = containerWidth;
        svgHeight = containerWidth / aspectRatio;
    } else {
        svgHeight = containerHeight;
        svgWidth = containerHeight * aspectRatio;
    }

    svg.style.width = `${svgWidth}px`;
    svg.style.height = `${svgHeight}px`;
    svg.style.position = 'absolute';
    svg.style.left = `${(containerWidth - svgWidth) / 2}px`;
    svg.style.top = `${(containerHeight - svgHeight) / 2}px`;

    svg.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    svg.addEventListener('wheel', resize);
}

function startDragging(e) {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originalX = svg.offsetLeft;
    originalY = svg.offsetTop;
}

function drag(e) {
    if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        svg.style.left = `${originalX + dx}px`;
        svg.style.top = `${originalY + dy}px`;
    }
}

function stopDragging() {
    isDragging = false;
}

function resize(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale *= delta;

    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const newWidth = rect.width * delta;
    const newHeight = rect.height * delta;

    svg.style.width = `${newWidth}px`;
    svg.style.height = `${newHeight}px`;

    svg.style.left = `${centerX - newWidth / 2}px`;
    svg.style.top = `${centerY - newHeight / 2}px`;
}

saveButton.addEventListener('click', () => {
    if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'modified_svg.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});