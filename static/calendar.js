// Helper function for reliable today detection
function isTodayDate(dateStr) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
}

// Calendar Web App JavaScript
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let events = {};
let holidays = {};

function showSuccessMessage(message) {
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    const messageIcon = document.getElementById('message-icon');
    successText.textContent = message;
    messageIcon.className = 'fas fa-check-circle';
    successMessage.classList.remove('error');
    successMessage.classList.add('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

function showErrorMessage(message) {
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    const messageIcon = document.getElementById('message-icon');
    successText.textContent = message;
    messageIcon.className = 'fas fa-times-circle';
    successMessage.classList.remove('show');
    successMessage.classList.add('error', 'show');
    
    setTimeout(() => {
        successMessage.classList.remove('show', 'error');
    }, 3000);
}

// Initialize the calendar
document.addEventListener('DOMContentLoaded', function() {
    updateCalendar();
    loadEvents();
    loadHolidays();
    
    // Set today's date in forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('event-date').value = today;
    document.getElementById('note-date').value = today;
    
    // Event form submission
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
    });
});

function updateCalendar() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Update header
    document.getElementById('current-month-year').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear calendar
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    // Add day headers
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add previous month's trailing days
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayElement = createDayElement(
            daysInPrevMonth - i, 
            currentMonth - 1, 
            currentYear, 
            true
        );
        calendarGrid.appendChild(dayElement);
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, currentMonth, currentYear, false);
        calendarGrid.appendChild(dayElement);
    }
    
    // Add next month's leading days
    const totalCells = calendarGrid.children.length - 7; // Subtract day headers
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, currentMonth + 1, currentYear, true);
        calendarGrid.appendChild(dayElement);
    }
}

function createDayElement(day, month, year, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // Check if it's today
    if (isTodayDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)) {
        dayElement.classList.add('today');
    }
    
    // Add day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Add event indicators
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (events[dateKey]) {
        dayElement.classList.add('has-event');
        events[dateKey].forEach(event => {
            const eventIndicator = document.createElement('div');
            eventIndicator.className = 'event-indicator';
            eventIndicator.textContent = event.title;
            eventIndicator.title = event.description;
            dayElement.appendChild(eventIndicator);
        });
    }
    
    if (holidays[dateKey]) {
        dayElement.classList.add('has-holiday');
        holidays[dateKey].forEach(holiday => {
            const holidayIndicator = document.createElement('div');
            holidayIndicator.className = 'holiday-indicator';
            
            // Check if it's a German holiday
            if (holiday.includes('Germany:')) {
                holidayIndicator.classList.add('germany');
                holidayIndicator.textContent = 'DE';
                holidayIndicator.title = holiday;
            } else {
                holidayIndicator.textContent = 'US';
                holidayIndicator.title = holiday;
            }
            
            dayElement.appendChild(holidayIndicator);
        });
    }
    
    // Check for notes
    checkAndDisplayNoteIndicator(dayElement, dateKey);
    
    // Add click event
    dayElement.addEventListener('click', function() {
        selectDate(year, month, day);
    });
    
    return dayElement;
}

function checkAndDisplayNoteIndicator(dayElement, dateKey) {
    fetch(`/api/notes?date=${dateKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.notes && data.notes.length > 0) {
                dayElement.classList.add('has-note');
                const noteIndicator = document.createElement('div');
                noteIndicator.className = 'note-indicator';
                noteIndicator.textContent = 'N';
                noteIndicator.title = `Has ${data.notes.length} note(s)`;
                dayElement.appendChild(noteIndicator);
            }
        })
        .catch(error => console.error('Error checking note:', error));
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
    loadEvents();
    loadHolidays();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
    loadEvents();
    loadHolidays();
}

function selectDate(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Update form dates
    document.getElementById('event-date').value = dateStr;
    document.getElementById('note-date').value = dateStr;
    
    // Load note for this date
    loadNote(dateStr);
    
    // Update the combined event details and note display
    updateEventDetailsAndNotesDisplay(dateStr);
}

function loadEvents() {
    console.log('Loading events for:', currentYear, currentMonth + 1);
    fetch(`/api/events?year=${currentYear}&month=${currentMonth + 1}`)
        .then(response => response.json())
        .then(data => {
            console.log('Events data received:', data);
            events = {};
            data.forEach(event => {
                const dateKey = event.start_date.split('T')[0];
                if (!events[dateKey]) {
                    events[dateKey] = [];
                }
                events[dateKey].push(event);
            });
            console.log('Events processed:', events);
            updateCalendar();
        })
        .catch(error => console.error('Error loading events:', error));
}

function loadEventsAndUpdate(eventDate) {
    console.log('Loading events and updating for:', currentYear, currentMonth + 1);
    fetch(`/api/events?year=${currentYear}&month=${currentMonth + 1}`)
        .then(response => response.json())
        .then(data => {
            console.log('Events data received:', data);
            events = {};
            data.forEach(event => {
                const dateKey = event.start_date.split('T')[0];
                if (!events[dateKey]) {
                    events[dateKey] = [];
                }
                events[dateKey].push(event);
            });
            console.log('Events processed:', events);
            // Update calendar first
            updateCalendar();
            // Then update the combined display if we have a specific date
            if (eventDate) {
                updateEventDetailsAndNotesDisplay(eventDate);
            }
        })
        .catch(error => console.error('Error loading events:', error));
}

function loadHolidays() {
    fetch(`/api/holidays?year=${currentYear}&month=${currentMonth + 1}&countries=US&countries=DE`)
        .then(response => response.json())
        .then(data => {
            holidays = data;
            updateCalendar();
        })
        .catch(error => console.error('Error loading holidays:', error));
}

function saveEvent() {
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        start_date: document.getElementById('event-date').value + 'T00:00:00',
        category: 'General'
    };
    
    console.log('Saving event:', eventData);
    
    fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Event save response:', data);
        if (data.success) {
            showSuccessMessage('Event saved successfully!');
            // Store the date before resetting the form
            const eventDate = document.getElementById('event-date').value;
            document.getElementById('event-form').reset();
            // Set the date back after reset
            document.getElementById('event-date').value = eventDate;
            // Reload events first, then update everything
            loadEventsAndUpdate(eventDate);
        } else {
            showErrorMessage('Error saving event: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error saving event');
    });
}

function loadNote(dateStr) {
    console.log('Loading notes for date:', dateStr);
    fetch(`/api/notes?date=${dateStr}`)
        .then(response => response.json())
        .then(data => {
            console.log('Notes data received:', data);
            const noteContent = document.getElementById('note-content');
            if (noteContent) {
                // For the sidebar, show the most recent note
                if (data.notes && data.notes.length > 0) {
                    noteContent.value = data.notes[0].content || '';
                } else {
                    noteContent.value = '';
                }
            }
            
            // Update the note display section
            updateNoteDisplay(dateStr, data.notes || []);
        })
        .catch(error => console.error('Error loading notes:', error));
}

function updateEventDetailsAndNotesDisplay(dateStr) {
    console.log('Updating event details and notes display for:', dateStr);
    const eventDetailsDisplay = document.getElementById('event-details-display');
    if (!eventDetailsDisplay) {
        console.error('Event details display element not found');
        return;
    }
    
    // Get events for this date
    const dateEvents = events[dateStr] || [];
    
    // Get notes for this date
    fetch(`/api/notes?date=${dateStr}`)
        .then(response => response.json())
        .then(data => {
            const notes = data.notes || [];
            
            // Check if this is today - use a more reliable method
            const isToday = isTodayDate(dateStr);
            
            let html = `<div class="event-details-date ${isToday ? 'today-highlight' : ''}">${formatDateForDisplay(dateStr)}${isToday ? ' <span class="today-badge">TODAY</span>' : ''}</div>`;
            
            // Add events
            if (dateEvents.length > 0) {
                html += '<div class="events-section">';
                html += '<h6><i class="fas fa-calendar-check"></i> Events</h6>';
                dateEvents.forEach(event => {
                    html += `
                        <div class="event-item mb-2 p-2 border rounded" data-event-id="${event.id}">
                            <div class="event-title">${event.title}</div>
                            <div class="event-description">${event.description || 'No description'}</div>
                            <small class="text-muted">Category: ${event.category}</small><br>
                            <div class="event-actions mt-2">
                                <button class="btn btn-sm btn-primary me-1" onclick="editEvent(${event.id}, '${dateStr}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            // Add notes
            if (notes.length > 0) {
                html += '<div class="notes-section">';
                html += '<h6><i class="fas fa-sticky-note"></i> Notes</h6>';
                notes.forEach((note, index) => {
                    html += `
                        <div class="note-item mb-2 p-2 border rounded">
                            <div class="note-content" id="note-content-${note.id}">${note.content}</div>
                            <small class="text-muted">Created: ${new Date(note.created_at).toLocaleString()}</small><br>
                            <div class="note-actions mt-2">
                                <button class="btn btn-sm btn-primary me-1" onclick="editNote(${note.id}, '${dateStr}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteNoteById(${note.id}, '${dateStr}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            if (dateEvents.length === 0 && notes.length === 0) {
                html += '<p class="text-muted">No events or notes for this date.</p>';
            }
            
            eventDetailsDisplay.innerHTML = html;
            
            // Update styling based on content
            if (dateEvents.length > 0 || notes.length > 0) {
                eventDetailsDisplay.classList.add('has-content');
            } else {
                eventDetailsDisplay.classList.remove('has-content');
            }
            
            console.log('Event details and notes display updated');
        })
        .catch(error => {
            console.error('Error loading notes for display:', error);
            eventDetailsDisplay.innerHTML = `<div class="event-details-date">${formatDateForDisplay(dateStr)}</div><p class="text-muted">Error loading content</p>`;
        });
}

function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function saveNote() {
    const noteData = {
        date: document.getElementById('note-date').value,
        content: document.getElementById('note-content').value
    };
    
    console.log('Saving note:', noteData);
    
    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Note save response:', data);
        if (data.success) {
            showSuccessMessage('Note saved successfully!');
            // Reload the note to ensure it's displayed
            const noteDate = document.getElementById('note-date').value;
            loadNote(noteDate);
            // Update the combined display
            updateEventDetailsAndNotesDisplay(noteDate);
            // Also refresh the calendar to show any visual indicators
            updateCalendar();
        } else {
            showErrorMessage('Error saving note: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error saving note');
    });
}

function addNote() {
    // Set the current date
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Set the date input to today
    document.getElementById('note-date').value = todayStr;
    
    // Clear the textarea and focus on it
    document.getElementById('note-content').value = '';
    document.getElementById('note-content').focus();
    
    // Update the combined display to show today's events and notes
    updateEventDetailsAndNotesDisplay(todayStr);
    
    // Show success message
    showSuccessMessage('Ready to add note for today!');
}

function saveNewNote() {
    const noteData = {
        date: document.getElementById('note-date').value,
        content: document.getElementById('note-content').value
    };
    
    console.log('Creating new note:', noteData);
    
    fetch('/api/notes/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('New note create response:', data);
        if (data.success) {
            showSuccessMessage('New note created successfully!');
            // Reload the note to ensure it's displayed
            const noteDate = document.getElementById('note-date').value;
            loadNote(noteDate);
            // Update the combined display
            updateEventDetailsAndNotesDisplay(noteDate);
            // Also refresh the calendar to show any visual indicators
            updateCalendar();
        } else {
            showErrorMessage('Error creating new note: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error creating new note');
    });
}

// Calculator functionality
let calcDisplay = '0';
let calcOperation = null;
let calcPreviousValue = null;
let calcExpression = '';
let calcHistory = [];

function calcInput(value) {
    const display = document.getElementById('calc-display');
    
    if (value === 'C') {
        calcDisplay = '0';
        calcOperation = null;
        calcPreviousValue = null;
        calcExpression = '';
    } else if (value === 'CE') {
        calcDisplay = '0';
        calcExpression = '';
    } else if (value === '=') {
        if (calcExpression) {
            calcExpression += calcDisplay;
            calculateExpression(calcExpression);
        }
    } else if (['+', '-', '*', '/'].includes(value)) {
        if (calcExpression) {
            calcExpression += calcDisplay + value;
        } else {
            calcExpression = calcDisplay + value;
        }
        calcDisplay = value; // Show the operator in display
    } else {
        if (calcDisplay === '0' || calcDisplay === 'Error' || ['+', '-', '*', '/'].includes(calcDisplay)) {
            calcDisplay = value;
        } else {
            calcDisplay += value;
        }
    }
    
    display.value = calcDisplay;
}

function calculateExpression(expression) {
    fetch('/api/calculator', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression: expression })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result !== undefined) {
            calcDisplay = data.result.toString();
            calcExpression = '';
            
            // Add to history
            calcHistory.unshift({
                expression: expression,
                result: data.result,
                timestamp: new Date().toLocaleTimeString()
            });
            
            // Keep only last 10 calculations
            if (calcHistory.length > 10) {
                calcHistory = calcHistory.slice(0, 10);
            }
            
            // Update history display
            updateCalcHistory();
        } else {
            calcDisplay = 'Error';
            calcExpression = '';
        }
        document.getElementById('calc-display').value = calcDisplay;
    })
    .catch(error => {
        calcDisplay = 'Error';
        calcExpression = '';
        document.getElementById('calc-display').value = calcDisplay;
    });
}

function updateCalcHistory() {
    const historyElement = document.getElementById('calc-history');
    if (historyElement) {
        historyElement.innerHTML = '';
        calcHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'calc-history-item';
            historyItem.innerHTML = `
                <div class="calc-history-expression">${item.expression}</div>
                <div class="calc-history-result">= ${item.result}</div>
                <div class="calc-history-time">${item.timestamp}</div>
            `;
            historyElement.appendChild(historyItem);
        });
    }
}

function editNote(noteId, dateStr) {
    const noteContentElement = document.getElementById(`note-content-${noteId}`);
    if (!noteContentElement) return;
    
    const currentContent = noteContentElement.textContent;
    
    // Create an input field to edit the note
    const editInput = document.createElement('textarea');
    editInput.className = 'form-control';
    editInput.value = currentContent;
    editInput.rows = 3;
    
    // Replace the content with the input field
    noteContentElement.innerHTML = '';
    noteContentElement.appendChild(editInput);
    editInput.focus();
    
    // Create save and cancel buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mt-2';
    buttonContainer.innerHTML = `
        <button class="btn btn-sm btn-success me-1" onclick="saveEditedNote(${noteId}, '${dateStr}')">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="btn btn-sm btn-secondary" onclick="cancelEditNote(${noteId}, '${dateStr}', '${currentContent.replace(/'/g, "\\'")}')">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
    
    // Find the note item and add buttons
    const noteItem = noteContentElement.closest('.note-item');
    const actionsDiv = noteItem.querySelector('.note-actions');
    actionsDiv.innerHTML = '';
    actionsDiv.appendChild(buttonContainer);
}

function saveEditedNote(noteId, dateStr) {
    const noteContentElement = document.getElementById(`note-content-${noteId}`);
    const editInput = noteContentElement.querySelector('textarea');
    const newContent = editInput.value;
    
    // Update the note via API
    fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage('Note updated successfully!');
            // Restore the display
            noteContentElement.innerHTML = newContent;
            // Restore the action buttons
            const noteItem = noteContentElement.closest('.note-item');
            const actionsDiv = noteItem.querySelector('.note-actions');
            actionsDiv.innerHTML = `
                <button class="btn btn-sm btn-primary me-1" onclick="editNote(${noteId}, '${dateStr}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteNoteById(${noteId}, '${dateStr}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
        } else {
            showErrorMessage('Error updating note: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error updating note');
    });
}

function cancelEditNote(noteId, dateStr, originalContent) {
    const noteContentElement = document.getElementById(`note-content-${noteId}`);
    noteContentElement.innerHTML = originalContent;
    
    // Restore the action buttons
    const noteItem = noteContentElement.closest('.note-item');
    const actionsDiv = noteItem.querySelector('.note-actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-sm btn-primary me-1" onclick="editNote(${noteId}, '${dateStr}')">
            <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteNoteById(${noteId}, '${dateStr}')">
            <i class="fas fa-trash"></i> Delete
        </button>
    `;
}

function editEvent(eventId, dateStr) {
    const eventItem = document.querySelector(`[data-event-id="${eventId}"]`);
    if (!eventItem) return;
    
    const event = events[dateStr]?.find(e => e.id === eventId);
    if (!event) return;
    
    // Create input fields for editing
    const titleElement = eventItem.querySelector('.event-title');
    const descriptionElement = eventItem.querySelector('.event-description');
    
    const currentTitle = titleElement.textContent;
    const currentDescription = descriptionElement.textContent;
    
    // Create input field for title
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'form-control form-control-sm';
    titleInput.value = currentTitle;
    
    // Create textarea for description
    const descriptionInput = document.createElement('textarea');
    descriptionInput.className = 'form-control form-control-sm';
    descriptionInput.rows = 2;
    descriptionInput.value = currentDescription;
    
    // Replace content with input fields
    titleElement.innerHTML = '';
    titleElement.appendChild(titleInput);
    descriptionElement.innerHTML = '';
    descriptionElement.appendChild(descriptionInput);
    
    // Focus on title input
    titleInput.focus();
    
    // Create save and cancel buttons
    const actionsDiv = eventItem.querySelector('.event-actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-sm btn-success me-1" onclick="saveEditedEvent(${eventId}, '${dateStr}')">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="btn btn-sm btn-secondary" onclick="cancelEditEvent(${eventId}, '${dateStr}', '${currentTitle.replace(/'/g, "\\'")}', '${currentDescription.replace(/'/g, "\\'")}')">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
}

function saveEditedEvent(eventId, dateStr) {
    const eventItem = document.querySelector(`[data-event-id="${eventId}"]`);
    if (!eventItem) return;
    
    const titleInput = eventItem.querySelector('.event-title input');
    const descriptionInput = eventItem.querySelector('.event-description textarea');
    
    const newTitle = titleInput.value;
    const newDescription = descriptionInput.value;
    
    // Update the event via API
    fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            title: newTitle,
            description: newDescription,
            start_date: events[dateStr].find(e => e.id === eventId).start_date,
            category: 'General'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage('Event updated successfully!');
            // Restore the display
            const titleElement = eventItem.querySelector('.event-title');
            const descriptionElement = eventItem.querySelector('.event-description');
            titleElement.innerHTML = newTitle;
            descriptionElement.innerHTML = newDescription;
            
            // Restore the action buttons
            const actionsDiv = eventItem.querySelector('.event-actions');
            actionsDiv.innerHTML = `
                <button class="btn btn-sm btn-primary me-1" onclick="editEvent(${eventId}, '${dateStr}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEvent(${eventId})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            
            // Update the events data
            const eventIndex = events[dateStr].findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                events[dateStr][eventIndex].title = newTitle;
                events[dateStr][eventIndex].description = newDescription;
            }
        } else {
            showErrorMessage('Error updating event: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error updating event');
    });
}

function cancelEditEvent(eventId, dateStr, originalTitle, originalDescription) {
    const eventItem = document.querySelector(`[data-event-id="${eventId}"]`);
    if (!eventItem) return;
    
    const titleElement = eventItem.querySelector('.event-title');
    const descriptionElement = eventItem.querySelector('.event-description');
    
    titleElement.innerHTML = originalTitle;
    descriptionElement.innerHTML = originalDescription;
    
    // Restore the action buttons
    const actionsDiv = eventItem.querySelector('.event-actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-sm btn-primary me-1" onclick="editEvent(${eventId}, '${dateStr}')">
            <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteEvent(${eventId})">
            <i class="fas fa-trash"></i> Delete
        </button>
    `;
}

function updateEvent(eventId) {
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        start_date: document.getElementById('event-date').value + 'T00:00:00',
        category: 'General'
    };
    
    console.log('Updating event:', eventData);
    
    fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Event update response:', data);
        if (data.success) {
            showSuccessMessage('Event updated successfully!');
            // Store the date before resetting the form
            const eventDate = document.getElementById('event-date').value;
            document.getElementById('event-form').reset();
            // Set the date back after reset
            document.getElementById('event-date').value = eventDate;
            // Reset the save button
            const saveButton = document.querySelector('button[onclick*="updateEvent"]');
            if (saveButton) {
                saveButton.innerHTML = '<i class="fas fa-save"></i> Save Event';
                saveButton.setAttribute('onclick', 'saveEvent()');
            }
            // Reload events first, then update everything
            loadEventsAndUpdate(eventDate);
        } else {
            showErrorMessage('Error updating event: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error updating event');
    });
}

// Event and Note Management Functions
function deleteEvent(eventId) {
    fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage('Event deleted successfully!');
            // Get the event date before reloading
            const eventDate = document.getElementById('event-date').value;
            // Reload events and update everything
            loadEventsAndUpdate(eventDate);
        } else {
            showErrorMessage('Error deleting event: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error deleting event');
    });
}

function deleteNoteById(noteId, dateStr) {
    fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage('Note deleted successfully!');
            // Update the combined display
            updateEventDetailsAndNotesDisplay(dateStr);
            // Update calendar
            updateCalendar();
        } else {
            showErrorMessage('Error deleting note: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error deleting note');
    });
}

function deleteNote(dateStr) {
    if (confirm('Are you sure you want to delete all notes for this date?')) {
        fetch('/api/notes', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: dateStr })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessMessage('Note deleted successfully!');
                // Clear the note content in sidebar
                document.getElementById('note-content').value = '';
                // Update the combined display
                updateEventDetailsAndNotesDisplay(dateStr);
                // Update calendar
                updateCalendar();
            } else {
                showErrorMessage('Error deleting note: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage('Error deleting note');
        });
    }
}

