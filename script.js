const fileInput = document.getElementById('fileInput');
const svgContainer = document.getElementById('svgContainer');
const saveButton = document.getElementById('saveButton');

let svg = null;
let isDragging = false;
let startX, startY, originalX, originalY;

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
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.position = 'absolute';

    svg.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    svg.addEventListener('wheel', resize);
}

function startDragging(e) {
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
    const scale = e.deltaY < 0 ? 1.1 : 0.9;
    const currentWidth = svg.clientWidth;
    const currentHeight = svg.clientHeight;
    svg.style.width = `${currentWidth * scale}px`;
    svg.style.height = `${currentHeight * scale}px`;
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