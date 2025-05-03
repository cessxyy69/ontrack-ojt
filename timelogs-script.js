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

//sign out galing kay chester
const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function() {
        if (window.firebase && firebase.auth) {
          firebase.auth().signOut().then(() => {
            window.location.href = "landing-page.html";
          });
        } else {
          // fallback: just redirect
          window.location.href = "landing-page.html";
        }
      });
    } // end

document.addEventListener('DOMContentLoaded', () => {
    // Get all required elements
    const newLogBtn = document.querySelector('.new-log-btn');
    const logFormOverlay = document.getElementById('logFormOverlay');
    const overlayBackground = document.getElementById('overlayBackground');
    const cancelBtn = document.getElementById('cancelBtn');
    const activityLogForm = document.getElementById('activityLogForm');
    const successPopup = document.getElementById('successPopup');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    // Get filter elements
    const searchInput = document.getElementById('search');
    const statusSelect = document.getElementById('status');
    const dateFilter = document.getElementById('date');
    const clearFilterBtn = document.querySelector('.clear-btn');

    // Get card elements
    const totalEntriesCard = document.querySelector('.tlcard1 h2');
    const totalHoursCard = document.querySelector('.tlcard2 h2');
    const approvedEntriesCard = document.querySelector('.tlcard3 h2');

    // Show overlay and form
    newLogBtn.addEventListener('click', () => {
        // Set current date as default value
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) {
            dateInput.value = today;
        }

        logFormOverlay.style.display = 'block';
        overlayBackground.style.display = 'block';
    });

    // Hide overlay when clicking cancel
    cancelBtn.addEventListener('click', () => {
        logFormOverlay.style.display = 'none';
        overlayBackground.style.display = 'none';
        activityLogForm.reset(); // Reset form fields
    });

    // Hide overlay when clicking outside
    overlayBackground.addEventListener('click', () => {
        logFormOverlay.style.display = 'none';
        overlayBackground.style.display = 'none';
        activityLogForm.reset(); // Reset form fields
        successPopup.style.display = 'none';
    });

    function loadSavedLogs() {
        const tableBody = document.querySelector('.logs-table tbody');
        const savedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

        tableBody.innerHTML = ''; // Clear existing table rows

        savedLogs.forEach(log => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${formatDate(log.date)}</td>
                <td>${formatTime(log.timeIn)} - ${formatTime(log.timeOut)}</td>
                <td>${log.hours}</td>
                <td>${log.activities}</td>
                <td><span class="status-${log.status.toLowerCase()}">${log.status}</span></td>
            `;
            tableBody.appendChild(newRow);
        });
    }

    // Add this helper function to format dates
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Call loadSavedLogs when the page loads
    loadSavedLogs();

    // Handle form submission
    activityLogForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const date = document.getElementById('date').value;
        const timeIn = document.getElementById('timeIn').value;
        const timeOut = document.getElementById('timeOut').value;
        const activities = document.getElementById('activities').value;

        // Calculate hours
        const timeInDate = new Date(`2000-01-01T${timeIn}`);
        const timeOutDate = new Date(`2000-01-01T${timeOut}`);
        const hours = ((timeOutDate - timeInDate) / (1000 * 60 * 60)).toFixed(1);

        // Create activity log object
        const activityLog = {
            date: date,
            timeIn: timeIn,
            timeOut: timeOut,
            hours: hours,
            activities: activities.trim(),
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Get existing logs from localStorage
        const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        existingLogs.unshift(activityLog);
        localStorage.setItem('activityLogs', JSON.stringify(existingLogs));

        // Format date for display
        const [year, month, day] = date.split('-');
        const dateObj = new Date(year, month - 1, day);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        loadSavedLogs();

        // Hide form and show success message
        logFormOverlay.style.display = 'none';
        successPopup.style.display = 'block';
        overlayBackground.style.display = 'block';
        activityLogForm.reset();
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

    // Helper function to format time to 12-hour format
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

    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToPDF);
    }

    function exportToPDF() {
        // Create PDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        // Add header
        doc.setFontSize(20);
        doc.text('Activity Logs Report', 15, 15);

        // Add metadata
        doc.setFontSize(10);
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generated on: ${today}`, 15, 22);

        // Get data from localStorage
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

        // Prepare table data
        const tableData = logs.map(log => {
            const date = new Date(log.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return [
                date,
                `${log.timeIn} - ${log.timeOut}`,
                log.hours,
                log.activities,
                log.status.charAt(0).toUpperCase() + log.status.slice(1)
            ];
        });

        // Add summary section
        const totalHours = logs.reduce((sum, log) => sum + parseFloat(log.hours), 0);
        const approvedEntries = logs.filter(log => log.status === 'approved').length;

        doc.text(`Total Entries: ${logs.length}`, 15, 29);
        doc.text(`Total Hours: ${totalHours.toFixed(1)}`, 80, 29);
        doc.text(`Approved Entries: ${approvedEntries}`, 145, 29);

        // Generate table
        doc.autoTable({
            startY: 35,
            head: [['Date', 'Time', 'Hours', 'Activities', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 30 }, // Date
                1: { cellWidth: 35 }, // Time
                2: { cellWidth: 20 }, // Hours
                3: { cellWidth: 120 }, // Activities
                4: { cellWidth: 25 } // Status
            },
            headStyles: {
                fillColor: [46, 101, 243],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            didDrawPage: function (data) {
                // Add footer
                doc.setFontSize(8);
                doc.text(
                    'OnTrack - OJT Monitoring System',
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }
        });

        // Save the PDF
        const filename = `activity_logs_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    }

    // Function to update cards
    function updateCards(logs) {
        const totalEntries = logs.length;
        const totalHours = logs.reduce((sum, log) => sum + parseFloat(log.hours), 0);
        const approvedEntries = logs.filter(log => log.status.toLowerCase() === 'approved').length;

        totalEntriesCard.textContent = totalEntries;
        totalHoursCard.textContent = totalHours.toFixed(1);
        approvedEntriesCard.textContent = approvedEntries;
    }

    // Function to apply filters
    function applyFilters() {
        let logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

        // Apply search filter
        if (searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            logs = logs.filter(log =>
                log.activities.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (statusSelect.value && statusSelect.value !== 'All Statuses') {
            logs = logs.filter(log =>
                log.status.toLowerCase() === statusSelect.value.toLowerCase()
            );
        }

        // Apply date filter
        if (dateFilter.value) {
            logs = logs.filter(log =>
                log.date === dateFilter.value
            );
        }

        // Update table with filtered logs
        const tbody = document.querySelector('.logs-table tbody');
        tbody.innerHTML = '';

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(log.date)}</td>
                <td>${formatTime(log.timeIn)} - ${formatTime(log.timeOut)}</td>
                <td>${log.hours}</td>
                <td>${log.activities}</td>
                <td><span class="status-${log.status.toLowerCase()}">${log.status}</span></td>
            `;
            tbody.appendChild(row);
        });

        // Update cards with filtered data
        updateCards(logs);
    }

    // Helper function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Helper function to format time
    function formatTime(timeString) {
        if (!timeString) return '';
        const time = new Date(`2000-01-01T${timeString}`);
        if (isNaN(time.getTime())) return timeString;

        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Add event listeners for filters
    searchInput.addEventListener('input', applyFilters);
    statusSelect.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);

    // Clear filters button
    clearFilterBtn.addEventListener('click', () => {
        searchInput.value = '';
        statusSelect.value = '';
        dateFilter.value = '';
        applyFilters();
    });



    applyFilters();
});