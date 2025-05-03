/* START JS FOR SIDEBAR */
const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const sidebar = document.querySelector('#sidebar');

openSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    openSidebarBtn.style.display = 'none';
    closeSidebarBtn.style.display = 'inline-block';
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    openSidebarBtn.style.display = 'inline-block';
    closeSidebarBtn.style.display = 'none';
});
/* END JS FOR SIDEBAR */

// Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBA4IwkROlhrz2ts19gLD48Cio_D0qiqbw",
      authDomain: "ontrack-585a4.firebaseapp.com",
      projectId: "ontrack-585a4",
      storageBucket: "ontrack-585a4.firebasestorage.app",
      messagingSenderId: "799924979752",
      appId: "1:799924979752:web:8a9579035dc75ea16dcd1d",
      measurementId: "G-TBF0Y7BNDK"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Global variables
    let currentUser = null;
    let userData = null;

    // Sign out functionality
    document.getElementById('signOutBtn').addEventListener('click', function() {
      auth.signOut().then(() => {
        window.location.href = "index.html";
      }).catch((error) => {
        console.error("Sign out error:", error);
        showNotification('Failed to sign out. Please try again.', 'error');
      });
    });

document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const openLogFormBtn = document.getElementById('openLogForm');
    const quickLogActivityBtn = document.getElementById('quickLogActivity');
    const logFormOverlay = document.getElementById('logFormOverlay');
    const overlayBackground = document.getElementById('overlayBackground');
    const cancelBtn = document.getElementById('cancelBtn');
    const successPopup = document.getElementById('successPopup');
    const activityLogForm = document.getElementById('activityLogForm');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    // Function to update recent activities display
    function displayRecentActivities() {
        // Sample data - replace this with your actual data fetching logic
        const recentActivities = [
            {
                date: 'Apr 14, 2025',
                timeRange: '9:00 AM - 2:00 PM',
                status: 'Pending'
            },
            {
                date: 'Apr 13, 2025',
                timeRange: '8:00 AM - 4:00 PM',
                status: 'Approved'
            }
            // Add more activities as needed
        ];

        const tbody = document.getElementById('recentActivitiesBody');
        tbody.innerHTML = ''; // Clear existing content

        recentActivities.forEach(activity => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${activity.date}</td>
                <td>${activity.timeRange}</td>
                <td><span class="status-${activity.status.toLowerCase()}">${activity.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateRecentActivities() {
        const tbody = document.getElementById('recentActivitiesBody');
        const savedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

        // Get only the 5 most recent logs
        const recentLogs = savedLogs.slice(0, 5);

        tbody.innerHTML = ''; // Clear existing content

        recentLogs.forEach(log => {
            try {
                // Parse the date properly
                const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${formatTime(log.timeIn)} - ${formatTime(log.timeOut)}</td>
                    <td><span class="status-${log.status.toLowerCase()}">${log.status}</span></td>
                `;
                tbody.appendChild(row);
            } catch (error) {
                console.error('Error formatting date:', error);
            }
        });
    }

    // Update the formatTime function to handle invalid times
    function formatTime(timeString) {
        try {
            if (!timeString) return '';
            const time = new Date(`2000-01-01T${timeString}`);
            if (isNaN(time.getTime())) return timeString; // Return original if invalid

            return time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString; // Return original if error occurs
        }
    }


    // Handle form submission
    if (activityLogForm) {
        activityLogForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const dateInput = document.getElementById('date');
            const timeInInput = document.getElementById('timeIn');
            const timeOutInput = document.getElementById('timeOut');
            const activitiesInput = document.getElementById('activities');

            // Validate form values
            if (!dateInput.value || !timeInInput.value || !timeOutInput.value || !activitiesInput.value.trim()) {
                alert('Please fill in all fields');
                return;
            }

            // Calculate hours
            const timeIn = new Date(`2000-01-01T${timeInInput.value}`);
            const timeOut = new Date(`2000-01-01T${timeOutInput.value}`);
            const hours = ((timeOut - timeIn) / (1000 * 60 * 60)).toFixed(1);

            // Create activity log object
            const activityLog = {
                date: dateInput.value,
                timeIn: timeInInput.value,
                timeOut: timeOutInput.value,
                hours: hours,
                activities: activitiesInput.value.trim(),
                status: 'Pending',
                submittedAt: new Date().toISOString()
            };

            try {
                // Get existing logs from localStorage
                const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

                // Add new log at the beginning
                existingLogs.unshift(activityLog);

                // Save updated logs back to localStorage
                localStorage.setItem('activityLogs', JSON.stringify(existingLogs));

                // Update UI immediately
                updateRecentActivities();
                updateProgressCards();

                // Hide form overlay
                logFormOverlay.style.display = 'none';

                // Show success popup
                successPopup.style.display = 'block';
                overlayBackground.style.display = 'block';

                // Reset form
                activityLogForm.reset();
                dateInput.value = new Date().toISOString().split('T')[0];

                // Redirect to timelogs.html after a short delay
                setTimeout(() => {
                    window.location.href = 'timelogs.html';
                }, 1500); // Wait 1.5 seconds before redirecting

            } catch (error) {
                console.error('Error saving to localStorage:', error);
                alert('Error saving your activity log. Please try again.');
            }
        });


        if (closeSuccessBtn) {
            closeSuccessBtn.addEventListener('click', function () {
                // Hide success popup and overlay
                successPopup.style.display = 'none';
                overlayBackground.style.display = 'none';

                // Reset form if needed
                if (activityLogForm) {
                    activityLogForm.reset();
                    // Set today's date as default
                    const dateInput = document.getElementById('date');
                    if (dateInput) {
                        dateInput.value = new Date().toISOString().split('T')[0];
                    }
                }

                updateProgressCards();
            });
        }
    }

    // Function to show the log form
    function showLogForm() {
        logFormOverlay.style.display = 'block';
        overlayBackground.style.display = 'block';

        // Set today's date as default
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            dateInput.value = formattedDate;
        }
    }

    // Function to hide the log form
    function hideLogForm() {
        logFormOverlay.style.display = 'none';
        overlayBackground.style.display = 'none';
        activityLogForm.reset(); // Reset form fields
        window.location.href = 'timelogs.html'; // Redirect to timelogs page
    }

    // Event listeners
    if (openLogFormBtn) {
        openLogFormBtn.addEventListener('click', showLogForm);
    }

    if (quickLogActivityBtn) {
        quickLogActivityBtn.addEventListener('click', showLogForm);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideLogForm);
    }

    // Close form when clicking outside
    if (overlayBackground) {
        overlayBackground.addEventListener('click', function (e) {
            if (e.target === overlayBackground) {
                hideLogForm();
            }
        });
    }

    const viewAllBtn = document.querySelector('.activity-header button');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function () {
            window.location.href = 'timelogs.html';
        });
    }

    function updateProgressCards() {
        const totalHoursElement = document.querySelector('.card1 h2');
        const completionElement = document.querySelector('.card2 h2');
        const progressFill = document.querySelector('.progress-fill');
        const requiredHoursElement = document.getElementById('requiredHours');

        if (!totalHoursElement || !completionElement || !progressFill || !requiredHoursElement) return;

        // Get logs from localStorage
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

        // Calculate total hours (excluding rejected logs)
        let totalHours = 0;
        logs.forEach(log => {
            if (log.status !== 'rejected') {
                totalHours += parseFloat(log.hours);
            }
        });

        // Round total hours to nearest whole number
        totalHours = Math.round(totalHours);

        // Get required hours
        const requiredHours = parseInt(requiredHoursElement.textContent) || 486;

        // Calculate completion percentage
        const completionPercentage = Math.min(100, Math.round((totalHours / requiredHours) * 100));

        // Update UI
        totalHoursElement.textContent = totalHours;
        completionElement.textContent = `${completionPercentage}%`;
        progressFill.style.width = `${completionPercentage}%`;

        // Update progress bar color based on completion
        if (completionPercentage >= 100) {
            progressFill.style.backgroundColor = '#4CAF50'; // Green
        } else if (completionPercentage >= 75) {
            progressFill.style.backgroundColor = '#2E65F3'; // Blue
        } else if (completionPercentage >= 50) {
            progressFill.style.backgroundColor = '#FF9800'; // Orange
        } else {
            progressFill.style.backgroundColor = '#f44336'; // Red
        }
    }

    const editHoursBtn = document.querySelector('.edit-hours-btn');
    if (editHoursBtn) {
        editHoursBtn.addEventListener('click', function () {
            // After hours are updated
            updateProgressCards();
        });
    }

    function initializeRequiredHours() {
        // Default required hours if not set
        const defaultHours = 486;
        let savedHours = localStorage.getItem('requiredHours');

        if (!savedHours) {
            localStorage.setItem('requiredHours', defaultHours);
            savedHours = defaultHours;
        }

        // Update UI with saved hours
        const requiredHoursElement = document.getElementById('requiredHours');
        if (requiredHoursElement) {
            requiredHoursElement.textContent = savedHours;
            updateCompletionPercentage(savedHours);
        }
    }

    function updateCompletionPercentage(requiredHours) {
        const totalHoursElement = document.querySelector('.card1 h2');
        const completionElement = document.querySelector('.card2 h2');
        const progressFill = document.querySelector('.progress-fill');

        if (!totalHoursElement || !completionElement || !progressFill) return;

        const totalHours = parseInt(totalHoursElement.textContent) || 0;
        const completion = Math.min(100, Math.round((totalHours / requiredHours) * 100));

        completionElement.textContent = `${completion}%`;
        progressFill.style.width = `${completion}%`;
    }

    // Add click handler for edit button
    const editBtn = document.querySelector('.edit-hours-btn');
    if (editBtn) {
        editBtn.addEventListener('click', handleRequiredHoursEdit);
    }

    function handleRequiredHoursEdit() {
        const currentHours = document.getElementById('requiredHours').textContent;
        const popup = createEditPopup(currentHours);
        document.body.appendChild(popup);

        document.getElementById('overlayBackground').style.display = 'block';
        popup.classList.add('active');
        popup.querySelector('input').focus();
    }

    function createEditPopup(currentValue) {
        const popup = document.createElement('div');
        popup.className = 'edit-hours-popup';
        popup.innerHTML = `
            <h3>Edit Required Hours</h3>
            <div class="form-group">
                <input type="number" id="newRequiredHours" value="${currentValue}" min="1">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="cancelHoursBtn">Cancel</button>
                <button type="button" class="btn-submit" id="saveHoursBtn">Save</button>
            </div>
        `;

        const saveBtn = popup.querySelector('#saveHoursBtn');
        const cancelBtn = popup.querySelector('#cancelHoursBtn');
        const input = popup.querySelector('#newRequiredHours');

        saveBtn.addEventListener('click', () => {
            const newHours = input.value;
            if (!newHours || newHours < 1) {
                alert('Please enter a valid number of hours');
                return;
            }

            localStorage.setItem('requiredHours', newHours);
            document.getElementById('requiredHours').textContent = newHours;
            updateCompletionPercentage(newHours);
            updateProgressCards();
            closeEditPopup();
        });

        cancelBtn.addEventListener('click', closeEditPopup);

        return popup;
    }

    function closeEditPopup() {
        const popup = document.querySelector('.edit-hours-popup');
        if (popup) {
            popup.remove();
        }
        const overlayBackground = document.getElementById('overlayBackground');
        if (overlayBackground) {
            overlayBackground.style.display = 'none';
        }
    }

    function initializeTargetDate() {
        const savedDate = localStorage.getItem('targetDate');
        if (savedDate) {
            const dateObj = new Date(savedDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const targetDateElement = document.getElementById('targetDate');
            if (targetDateElement) {
                targetDateElement.textContent = formattedDate;
                updateDaysLeft(dateObj);
            }
        }

        // Add click handler for edit date button
        const editDateBtn = document.querySelector('.edit-date-btn');
        if (editDateBtn) {
            editDateBtn.addEventListener('click', showDateEditPopup);
        }
    }

    function showDateEditPopup() {
        const popup = document.createElement('div');
        popup.className = 'days-edit-popup';
        popup.innerHTML = `
        <h3>Edit Target Date</h3>
        <div class="form-group">
            <input type="date" id="newTargetDate" required>
        </div>
        <div class="form-actions">
            <button type="button" class="btn-cancel" id="cancelDateBtn">Cancel</button>
            <button type="button" class="btn-submit" id="saveDateBtn">Save</button>
        </div>
    `;

        document.body.appendChild(popup);
        const overlayBackground = document.getElementById('overlayBackground');
        if (overlayBackground) {
            overlayBackground.style.display = 'block';
        }

        setTimeout(() => {
            popup.classList.add('active');

            const input = popup.querySelector('#newTargetDate');
            const saveBtn = popup.querySelector('#saveDateBtn');
            const cancelBtn = popup.querySelector('#cancelDateBtn');

            // Don't set any initial value for the input
            input.focus();

            saveBtn.addEventListener('click', function () {
                if (!input.value) {
                    alert('Please select a date');
                    return;
                }

                const newDate = new Date(input.value);
                if (isNaN(newDate.getTime())) {
                    alert('Invalid date selected');
                    return;
                }

                // Format date for display
                const formattedDate = newDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                // Save to localStorage
                localStorage.setItem('targetDate', input.value);
                localStorage.setItem('targetDateFormatted', formattedDate);

                // Update UI
                document.getElementById('targetDate').textContent = formattedDate;
                updateDaysLeft(newDate);

                closeDateEditPopup();
            });

            cancelBtn.addEventListener('click', closeDateEditPopup);
        }, 10);
    }

    function closeDateEditPopup() {
        const popup = document.querySelector('.days-edit-popup');
        if (popup) {
            popup.remove();
        }
        const overlayBackground = document.getElementById('overlayBackground');
        if (overlayBackground) {
            overlayBackground.style.display = 'none';
        }
    }

    function updateDaysLeft(targetDate) {
        const today = new Date();
        const timeDiff = targetDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        const daysLeftElement = document.querySelector('.card3 h2');
        if (daysLeftElement) {
            daysLeftElement.textContent = Math.max(0, daysLeft);
            localStorage.setItem('daysLeft', Math.max(0, daysLeft));
        }
    }

    function fetchUpcomingTasks() {
        // Get tasks from localStorage or initialize empty array if none exists
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

        // If no tasks exist, create some sample data
        if (tasks.length === 0) {
            const sampleTasks = [
                {
                    title: "Complete Weekly Report",
                    dueDate: "2025-05-15",
                    status: "Pending",
                    priority: "high"
                },
                {
                    title: "Submit Documentation",
                    dueDate: "2025-05-10",
                    status: "In Progress",
                    priority: "normal"
                },
                {
                    title: "Team Progress Meeting",
                    dueDate: "2025-05-08",
                    status: "Pending",
                    priority: "high"
                }
            ];
            localStorage.setItem('tasks', JSON.stringify(sampleTasks));
            displayUpcomingTasks(sampleTasks);
        } else {
            displayUpcomingTasks(tasks);
        }

        // Update pending tasks count in dashboard card
        const pendingTasksCount = tasks.filter(task =>
            task.status.toLowerCase() === 'pending'
        ).length;
        const pendingTasksElement = document.querySelector('.card4 h2');
        if (pendingTasksElement) {
            pendingTasksElement.textContent = pendingTasksCount;
        }
    }

    const viewAllTasksLink = document.querySelector('#viewAllTasks');
    if (viewAllTasksLink) {
        viewAllTasksLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'tasks.html';
        });
    }

    function displayUpcomingTasks(tasks) {
        const container = document.getElementById('upcomingTasksContainer');
        container.innerHTML = ''; // Clear existing tasks

        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    function createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';

        taskDiv.innerHTML = `
            <div class="task-icon ${task.priority === 'high' ? 'red' : 'yellow'}">🗂️</div>
            <div class="task-info">
                <p class="task-title">${task.title}</p>
                <p class="task-date">Due: ${formatDate(task.dueDate)}</p>
            </div>
            <span class="task-status ${task.status.toLowerCase()}">${task.status}</span>
        `;

        return taskDiv;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Add click event listener to create task button
    const createTaskBtn = document.getElementById('createTaskBtn');
    createTaskBtn.addEventListener('click', () => {
        document.getElementById('overlay').classList.add('active');
    });

    // Update the closeForm function
    function closeForm() {
        const form = document.querySelector('.add-task-form');
        form.reset();
        document.getElementById('formTitle').textContent = 'Add New Task';
        document.getElementById('submitBtn').textContent = 'Add Task';
        isEditing = false;
        editingTaskIndex = null;
        document.getElementById('overlay').classList.remove('active');
    }

    // Function to handle form submission
    function addTask(event) {
        event.preventDefault();

        const newTask = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value,
            status: "Pending"
        };

        // Get existing tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

        // Add new task to array
        tasks.unshift(newTask);

        // Save back to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Close the form
        closeForm();

        // Refresh the tasks display
        fetchUpcomingTasks();

        // Show success message
        const successPopup = document.getElementById('successPopup');
        successPopup.style.display = 'block';
        document.getElementById('overlayBackground').style.display = 'block';

        // Hide success message after 2 seconds
        setTimeout(() => {
            successPopup.style.display = 'none';
            document.getElementById('overlayBackground').style.display = 'none';
        }, 2000);
    }

    // Make these functions globally available
    window.closeForm = closeForm;
    window.addTask = addTask;

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initializeRequiredHours);
    document.addEventListener('DOMContentLoaded', displayRecentActivities);

    // Call updateProgressCards initially
    initializeTargetDate();
    initializeRequiredHours();
    updateProgressCards();
    updateRecentActivities();
    fetchUpcomingTasks();
});

