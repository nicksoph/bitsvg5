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
    if (!svg) return;

    // Remove any existing width and height attributes
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    // Set the SVG to fill the container while maintaining aspect ratio
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block'; // Ensures the SVG takes up the full space

    // Ensure the viewBox is set
    if (!svg.getAttribute('viewBox')) {
        const bbox = svg.getBBox();
        svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    }

    // Center the SVG content
    const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    svg.style.overflow = 'visible';
    svg.style.transform = `translate(${-viewBox[0]}px, ${-viewBox[1]}px)`;

    svg.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    svgContainer.addEventListener('wheel', resize);
}

function startDragging(e) {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originalX = svg.getBoundingClientRect().left - svgContainer.getBoundingClientRect().left;
    originalY = svg.getBoundingClientRect().top - svgContainer.getBoundingClientRect().top;
}

function drag(e) {
    if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        svg.style.transform = `translate(${originalX + dx}px, ${originalY + dy}px) scale(${scale})`;
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
    const containerRect = svgContainer.getBoundingClientRect();

    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    const dx = (mouseX - rect.left) * (1 - delta);
    const dy = (mouseY - rect.top) * (1 - delta);

    const currentTransform = svg.style.transform;
    const match = currentTransform.match(/translate\(([\d.-]+)px,\s*([\d.-]+)px\)/);
    const currentX = match ? parseFloat(match[1]) : 0;
    const currentY = match ? parseFloat(match[2]) : 0;

    svg.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px) scale(${scale})`;
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