
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('sidebar');
            const canvas = document.getElementById('canvas');
            const properties = document.getElementById('properties');
            const propertyForm = document.getElementById('property-form');
            
            let selectedElement = null;
            let selectedElementData = null;
            let offsetX, offsetY;

            // Make sidebar items draggable
            const sidebarItems = document.querySelectorAll('.sidebar-item');
            sidebarItems.forEach(item => {
                item.setAttribute('draggable', 'true');
                
                item.addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('type', this.dataset.type);
                });
            });

            // Canvas drop handlers
            canvas.addEventListener('dragover', function(e) {
                e.preventDefault();
            });

            canvas.addEventListener('drop', function(e) {
                e.preventDefault();
                
                const type = e.dataTransfer.getData('type');
                if (!type) return;

                const canvasRect = canvas.getBoundingClientRect();
                const x = e.clientX - canvasRect.left;
                const y = e.clientY - canvasRect.top;

                createElement(type, x, y);
            });

            // Create new elements on canvas
            function createElement(type, x, y) {
                const element = document.createElement('div');
                element.className = 'canvas-item';
                element.style.left = x + 'px';
                element.style.top = y + 'px';
                
                // Default properties for each element type
                const defaultProps = {
                    header: {
                        text: 'New Header',
                        fontSize: '24px',
                        color: '#333333',
                        alignment: 'left'
                    },
                    paragraph: {
                        text: 'Click to edit this paragraph text.',
                        fontSize: '16px',
                        color: '#333333',
                        alignment: 'left'
                    },
                    button: {
                        text: 'Button',
                        fontSize: '14px',
                        color: '#ffffff',
                        bgColor: '#4285f4',
                        alignment: 'center'
                    },
                    image: {
                        src: 'https://via.placeholder.com/200x150',
                        width: '200px',
                        alt: 'Image placeholder'
                    }
                };
                
                // Store element data
                element.dataset.props = JSON.stringify(defaultProps[type]);
                
                // Add content based on type
                switch(type) {
                    case 'header':
                        element.innerHTML = `<h2 class="element-header">${defaultProps[type].text}</h2>`;
                        applyTextStyles(element.querySelector('h2'), defaultProps[type]);
                        break;
                    case 'paragraph':
                        element.innerHTML = `<p class="element-paragraph">${defaultProps[type].text}</p>`;
                        applyTextStyles(element.querySelector('p'), defaultProps[type]);
                        break;
                    case 'button':
                        element.innerHTML = `<button class="element-button">${defaultProps[type].text}</button>`;
                        applyButtonStyles(element.querySelector('button'), defaultProps[type]);
                        break;
                    case 'image':
                        element.innerHTML = `
                            <div class="element-image">
                                <img src="${defaultProps[type].src}" alt="${defaultProps[type].alt}" style="width:${defaultProps[type].width}">
                            </div>
                        `;
                        break;
                }

                // Make element draggable
                element.addEventListener('mousedown', startDrag);
                element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selectElement(this);
                });

                canvas.appendChild(element);
                selectElement(element);
            }

            // Apply text styles
            function applyTextStyles(el, props) {
                el.style.fontSize = props.fontSize;
                el.style.color = props.color;
                el.style.textAlign = props.alignment;
                el.textContent = props.text;
            }
            
            // Apply button styles
            function applyButtonStyles(el, props) {
                el.style.fontSize = props.fontSize;
                el.style.color = props.color;
                el.style.backgroundColor = props.bgColor;
                el.style.textAlign = props.alignment;
                el.textContent = props.text;
            }

            // Element selection
            function selectElement(element) {
                // Deselect all
                document.querySelectorAll('.canvas-item').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Select new one
                element.classList.add('selected');
                selectedElement = element;
                selectedElementData = JSON.parse(element.dataset.props || '{}');
                
                // Update properties panel
                updatePropertiesPanel(element);
            }

            // Canvas click (deselect)
            canvas.addEventListener('click', function() {
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                    selectedElement = null;
                    selectedElementData = null;
                    propertyForm.innerHTML = '<p>Select an element to edit its properties</p>';
                }
            });

            // Update properties panel based on selected element
            function updatePropertiesPanel(element) {
                const type = element.querySelector('h2, p, button, .element-image')?.className.replace('element-', '');
                if (!type) return;
                
                let formHTML = '';
                
                switch(type) {
                    case 'header':
                    case 'paragraph':
                        formHTML = `
                            <div class="property-group">
                                <div class="property-group-title">Text</div>
                                <div class="form-group">
                                    <label>Content</label>
                                    <input type="text" id="text-content" value="${selectedElementData.text || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Font Size</label>
                                    <input type="text" id="font-size" value="${selectedElementData.fontSize || '16px'}">
                                </div>
                                <div class="form-group">
                                    <label>Text Color</label>
                                    <input type="color" id="text-color" value="${selectedElementData.color || '#333333'}">
                                    <span class="color-preview" style="background:${selectedElementData.color || '#333333'}"></span>
                                </div>
                                <div class="form-group">
                                    <label>Alignment</label>
                                    <select id="text-align">
                                        <option value="left" ${selectedElementData.alignment === 'left' ? 'selected' : ''}>Left</option>
                                        <option value="center" ${selectedElementData.alignment === 'center' ? 'selected' : ''}>Center</option>
                                        <option value="right" ${selectedElementData.alignment === 'right' ? 'selected' : ''}>Right</option>
                                    </select>
                                </div>
                            </div>
                        `;
                        break;
                        
                    case 'button':
                        formHTML = `
                            <div class="property-group">
                                <div class="property-group-title">Button</div>
                                <div class="form-group">
                                    <label>Button Text</label>
                                    <input type="text" id="button-text" value="${selectedElementData.text || 'Button'}">
                                </div>
                                <div class="form-group">
                                    <label>Font Size</label>
                                    <input type="text" id="button-font-size" value="${selectedElementData.fontSize || '14px'}">
                                </div>
                                <div class="form-group">
                                    <label>Text Color</label>
                                    <input type="color" id="button-text-color" value="${selectedElementData.color || '#ffffff'}">
                                    <span class="color-preview" style="background:${selectedElementData.color || '#ffffff'}"></span>
                                </div>
                                <div class="form-group">
                                    <label>Background Color</label>
                                    <input type="color" id="button-bg-color" value="${selectedElementData.bgColor || '#4285f4'}">
                                    <span class="color-preview" style="background:${selectedElementData.bgColor || '#4285f4'}"></span>
                                </div>
                                <div class="form-group">
                                    <label>Alignment</label>
                                    <select id="button-align">
                                        <option value="left" ${selectedElementData.alignment === 'left' ? 'selected' : ''}>Left</option>
                                        <option value="center" ${selectedElementData.alignment === 'center' ? 'selected' : ''}>Center</option>
                                        <option value="right" ${selectedElementData.alignment === 'right' ? 'selected' : ''}>Right</option>
                                    </select>
                                </div>
                            </div>
                        `;
                        break;
                        
                    case 'image':
                        formHTML = `
                            <div class="property-group">
                                <div class="property-group-title">Image</div>
                                <div class="form-group">
                                    <label>Image URL</label>
                                    <input type="text" id="image-src" value="${selectedElementData.src || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Width</label>
                                    <input type="text" id="image-width" value="${selectedElementData.width || '200px'}">
                                </div>
                                <div class="form-group">
                                    <label>Alt Text</label>
                                    <input type="text" id="image-alt" value="${selectedElementData.alt || ''}">
                                </div>
                            </div>
                        `;
                        break;
                }
                
                propertyForm.innerHTML = formHTML;
                
                // Add event listeners to form inputs
                addPropertyChangeListeners(type);
            }
            
            // Add event listeners for property changes
            function addPropertyChangeListeners(type) {
                switch(type) {
                    case 'header':
                    case 'paragraph':
                        document.getElementById('text-content').addEventListener('input', function() {
                            selectedElementData.text = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('font-size').addEventListener('input', function() {
                            selectedElementData.fontSize = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('text-color').addEventListener('input', function() {
                            selectedElementData.color = this.value;
                            document.querySelector('.color-preview').style.background = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('text-align').addEventListener('change', function() {
                            selectedElementData.alignment = this.value;
                            updateSelectedElement();
                        });
                        break;
                        
                    case 'button':
                        document.getElementById('button-text').addEventListener('input', function() {
                            selectedElementData.text = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('button-font-size').addEventListener('input', function() {
                            selectedElementData.fontSize = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('button-text-color').addEventListener('input', function() {
                            selectedElementData.color = this.value;
                            document.querySelectorAll('.color-preview')[0].style.background = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('button-bg-color').addEventListener('input', function() {
                            selectedElementData.bgColor = this.value;
                            document.querySelectorAll('.color-preview')[1].style.background = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('button-align').addEventListener('change', function() {
                            selectedElementData.alignment = this.value;
                            updateSelectedElement();
                        });
                        break;
                        
                    case 'image':
                        document.getElementById('image-src').addEventListener('input', function() {
                            selectedElementData.src = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('image-width').addEventListener('input', function() {
                            selectedElementData.width = this.value;
                            updateSelectedElement();
                        });
                        
                        document.getElementById('image-alt').addEventListener('input', function() {
                            selectedElementData.alt = this.value;
                            updateSelectedElement();
                        });
                        break;
                }
            }
            
            // Update the selected element with new properties
            function updateSelectedElement() {
                if (!selectedElement) return;
                
                // Update the element's data
                selectedElement.dataset.props = JSON.stringify(selectedElementData);
                
                // Apply the changes visually
                const type = selectedElement.querySelector('h2, p, button, .element-image')?.className.replace('element-', '');
                switch(type) {
                    case 'header':
                    case 'paragraph':
                        applyTextStyles(selectedElement.querySelector('h2, p'), selectedElementData);
                        break;
                    case 'button':
                        applyButtonStyles(selectedElement.querySelector('button'), selectedElementData);
                        break;
                    case 'image':
                        const img = selectedElement.querySelector('img');
                        if (img) {
                            img.src = selectedElementData.src || '';
                            img.style.width = selectedElementData.width || '200px';
                            img.alt = selectedElementData.alt || '';
                        }
                        break;
                }
            }

            // Drag existing elements
            function startDrag(e) {
                if (e.target !== this && !this.contains(e.target)) return;
                
                const rect = this.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                
                document.addEventListener('mousemove', dragElement);
                document.addEventListener('mouseup', stopDrag);
            }

            function dragElement(e) {
                if (!selectedElement) return;
                
                const canvasRect = canvas.getBoundingClientRect();
                let x = e.clientX - canvasRect.left - offsetX;
                let y = e.clientY - canvasRect.top - offsetY;
                
                // Boundary checks
                x = Math.max(0, Math.min(x, canvasRect.width - selectedElement.offsetWidth));
                y = Math.max(0, Math.min(y, canvasRect.height - selectedElement.offsetHeight));
                
                selectedElement.style.left = x + 'px';
                selectedElement.style.top = y + 'px';
            }

            function stopDrag() {
                document.removeEventListener('mousemove', dragElement);
                document.removeEventListener('mouseup', stopDrag);
            }
        });