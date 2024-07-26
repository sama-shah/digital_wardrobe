document.addEventListener('DOMContentLoaded', function() {
    const clothingItems = document.querySelectorAll('.clothing-item');
    const outfitCanvas = document.getElementById('outfit-canvas');
    const resetButton = document.getElementById('reset-button');

    let topItem = null;
    let bottomItem = null;
    let leftAccessories = [];
    let rightAccessories = [];

    let items = [];

    // const uploadForm = document.getElementById('upload-form');
    // uploadForm.addEventListener('submit', handleUpload);

    // function handleUpload(e) {
    //     e.preventDefault();
    //     const fileInput = document.getElementById('image-upload');
    //     const file = fileInput.files[0];
    //     const itemType = document.getElementById('item-type').value;

    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = function(e) {
    //             const img = new Image();
    //             img.src = e.target.result;
    //             img.onload = function() {
    //                 addClothingItem(img.src, itemType);
    //             }
    //         }
    //         reader.readAsDataURL(file);
    //     }
    // }

    const uploadButton = document.getElementById('upload-button');
    const modal = document.getElementById('upload-modal');
    const closeBtn = modal.querySelector('.close');
    const uploadForm = document.getElementById('upload-form');

    uploadButton.onclick = function() {
        modal.style.display = "block";
    }

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleUpload();
    });

    function handleUpload() {
        const fileInput = document.getElementById('image-upload');
        const file = fileInput.files[0];
        const itemType = document.getElementById('item-type').value;

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    addClothingItem(img.src, itemType);
                    modal.style.display = "none";
                    uploadForm.reset();
                }
            }
            reader.readAsDataURL(file);
        }
    }

    function updateLayout() {
        const canvasRect = outfitCanvas.getBoundingClientRect();
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;

        if (topItem) {
            topItem.style.left = `${centerX - topItem.offsetWidth / 2}px`;
            topItem.style.top = `${centerY - topItem.offsetHeight / 2 - 50}px`;
        }

        if (bottomItem) {
            bottomItem.style.left = `${centerX - bottomItem.offsetWidth / 2}px`;
            bottomItem.style.top = `${centerY + 50}px`;
        }

        leftAccessories.forEach((item, index) => {
            item.style.left = `${centerX - item.offsetWidth - 50 - index * 20}px`;
            item.style.top = `${centerY - item.offsetHeight / 2 + index * 20}px`;
        });

        rightAccessories.forEach((item, index) => {
            item.style.left = `${centerX + 50 + index * 20}px`;
            item.style.top = `${centerY - item.offsetHeight / 2 + index * 20}px`;
        });
    }


    function makeResizable(element) {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.style.width = '10px';
        resizer.style.height = '10px';
        resizer.style.background = 'blue';
        resizer.style.position = 'absolute';
        resizer.style.right = '0';
        resizer.style.bottom = '0';
        resizer.style.cursor = 'se-resize';
        element.appendChild(resizer);

        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;

        resizer.addEventListener('mousedown', function(e) {
            e.preventDefault();
            original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
            original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
            original_x = element.getBoundingClientRect().left;
            original_y = element.getBoundingClientRect().top;
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
            const canvas = outfitCanvas;
            const canvasRect = canvas.getBoundingClientRect();
            const maxWidth = canvasRect.width - element.offsetLeft;
            const maxHeight = canvasRect.height - element.offsetTop;
    
            const width = Math.min(original_width + (e.pageX - original_mouse_x), maxWidth);
            const height = Math.min(original_height + (e.pageY - original_mouse_y), maxHeight);
    
            if (width > 20) {
                element.style.width = width + 'px';
            }
            if (height > 20) {
                element.style.height = height + 'px';
            }
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize);
        }
    }

    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY;
    
        element.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    
        function startDrag(e) {
            if (e.target.classList.contains('resizer')) return;
            isDragging = true;
            startX = e.clientX - element.offsetLeft;
            startY = e.clientY - element.offsetTop;
            element.style.zIndex = getHighestZIndex() + 1;
        }
    
        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            let newX = e.clientX - startX;
            let newY = e.clientY - startY;
    
            const canvas = outfitCanvas;
            const canvasRect = canvas.getBoundingClientRect();
            
            newX = Math.max(0, Math.min(newX, canvasRect.width - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, canvasRect.height - element.offsetHeight));
    
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        }
    
        function stopDrag() {
            isDragging = false;
        }
    
        function getHighestZIndex() {
            return Math.max(
                ...Array.from(document.querySelectorAll('.outfit-item'))
                    .map(item => parseInt(getComputedStyle(item).zIndex) || 0)
            );
        }
    }


    function getRandomPosition(canvasWidth, canvasHeight, itemWidth, itemHeight, centerBias = 0.5) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
    
        const maxOffsetX = (canvasWidth - itemWidth) / 2 * centerBias;
        const maxOffsetY = (canvasHeight - itemHeight) / 2 * centerBias;
    
        const randomX = (Math.random() - 0.5) * 2 * maxOffsetX;
        const randomY = (Math.random() - 0.5) * 2 * maxOffsetY;
    
        return {
            x: Math.max(0, Math.min(centerX + randomX - itemWidth / 2, canvasWidth - itemWidth)),
            y: Math.max(0, Math.min(centerY + randomY - itemHeight / 2, canvasHeight - itemHeight))
        };
    }

    function addClothingItem(imageSrc, type) {
        // const container = document.getElementById(`${type}s`);
        const containerId = type === 'accessory' ? 'accessories' : `${type}s`;
        const container = document.getElementById(containerId);
        if (!container) {
        console.error(`Container not found for type: ${type}`);
        return;
    }
        const newItem = document.createElement('img');
        newItem.src = imageSrc;
        newItem.className = 'clothing-item';
        newItem.dataset.type = type;
        container.appendChild(newItem);

        // Add the click event listener to the new item
        newItem.addEventListener('click', function() {
            const clone = this.cloneNode(true);
            clone.classList.add('outfit-item');
            clone.style.position = 'absolute';

            const canvasRect = outfitCanvas.getBoundingClientRect();
            let itemWidth, itemHeight;

            switch(type) {
                case 'top':
                    itemWidth = 200;
                    itemHeight = 200;
                    break;
                case 'bottom':
                    itemWidth = 250;
                    itemHeight = 250;
                    break;
                case 'accessory':
                    itemWidth = 100;
                    itemHeight = 100;
                    break;
            }

            const position = getRandomPosition(canvasRect.width, canvasRect.height, itemWidth, itemHeight);

            clone.style.left = `${position.x}px`;
            clone.style.top = `${position.y}px`;
            clone.style.width = `${itemWidth}px`;
            clone.style.height = `${itemHeight}px`;
            clone.style.objectFit = 'contain';

            outfitCanvas.appendChild(clone);
            items.push(clone);

            makeDraggable(clone);
            makeResizable(clone);
        });
    }


    resetButton.addEventListener('click', function() {
        outfitCanvas.innerHTML = '';
        items = [];
    });

    window.addEventListener('resize', updateLayout);

});


