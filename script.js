// =========================
// ELEMENT
// =========================

const addTaskBtn = document.querySelector(".add-task-btn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");
const filterOptions = filterMenu.querySelectorAll("button");

const searchInput = document.getElementById("searchInput");


// =========================
// DATA TASK
// =========================

let tasks = JSON.parse(
    localStorage.getItem("studyTrackTasks")
) || [];

let currentFilter = "all";


// =========================
// OPEN MODAL
// =========================

addTaskBtn.addEventListener("click", function () {
    taskModal.classList.add("active");
});


// =========================
// CLOSE MODAL
// =========================

closeModal.addEventListener("click", function () {
    taskModal.classList.remove("active");
});

cancelBtn.addEventListener("click", function () {
    taskModal.classList.remove("active");
});


// =========================
// CLOSE OUTSIDE MODAL
// =========================

taskModal.addEventListener("click", function (event) {

    if (event.target === taskModal) {
        taskModal.classList.remove("active");
    }

});


// =========================
// SAVE TASK
// =========================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const taskName =
        document.getElementById("taskName").value.trim();

    const taskSubject =
        document.getElementById("taskSubject").value.trim();

    const taskDeadline =
        document.getElementById("taskDeadline").value;

    const taskType =
        document.getElementById("taskType").value;


    // Buat data task baru
    const newTask = {

        id: Date.now(),

        name: taskName,

        subject: taskSubject,

        deadline: taskDeadline,

        type: taskType,

        completed: false

    };


    // Masukkan task ke array
    tasks.push(newTask);


    // Simpan ke LocalStorage
    saveTasks();


    // Tampilkan task
    renderTasks();


    // Reset form
    taskForm.reset();


    // Tutup modal
    taskModal.classList.remove("active");

});


// =========================
// SAVE TO LOCAL STORAGE
// =========================

function saveTasks() {

    localStorage.setItem(
        "studyTrackTasks",
        JSON.stringify(tasks)
    );

}


// =========================
// RENDER TASK
// =========================

function renderTasks() {

    // Kosongkan task list
    taskList.innerHTML = "";


    // Kalau belum ada task
    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌱</div>
                <h3>No tasks yet</h3>
                <p>Add your first task and keep everything organized.</p>
            </div>
        `;

        updateStats();

        return;
    }


    // Buat card untuk setiap task
    tasks.forEach(function (task) {

        const taskCard =
            document.createElement("div");


        taskCard.classList.add("task-card");


        // Simpan deadline
        taskCard.dataset.deadline =
            task.deadline;


        // Simpan ID task
        taskCard.dataset.id =
            task.id;


        // Kalau task sudah selesai
        if (task.completed) {

            taskCard.classList.add("completed");

        }


        taskCard.innerHTML = `

            <div class="task-image">
                📚
            </div>


            <div class="task-content">

                <p class="task-category">
                    ${task.subject}
                </p>

                <h3>
                    ${task.name}
                </h3>

                <div class="task-info">

                    <span>
                        📅 ${formatDate(task.deadline)}
                    </span>

                    <span>
                        📄 ${task.type}
                    </span>

                </div>

            </div>


            <div class="task-actions">

                <button
                    class="done-btn"
                    data-id="${task.id}">
                    ${task.completed ? "✓ Completed" : "○ Done"}
                </button>


                <button
                    class="delete-btn"
                    data-id="${task.id}">
                    🗑️
                </button>

            </div>

        `;


        taskList.appendChild(taskCard);

    });


    // Update statistik
    updateStats();


    // Terapkan search + filter
    applyTaskFilter();

}


// =========================
// FORMAT DATE
// =========================

function formatDate(date) {

    const dateObject =
        new Date(date);


    return dateObject.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


// =========================
// UPDATE STATISTICS
// =========================

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    const pending =
        total - completed;


    document.getElementById("totalTasks")
        .textContent = total;


    document.getElementById("pendingTasks")
        .textContent = pending;


    document.getElementById("completedTasks")
        .textContent = completed;

}


// =========================
// TASK ACTIONS
// =========================

taskList.addEventListener(
    "click",
    function (event) {


        // =====================
        // DONE
        // =====================

        if (
            event.target.classList.contains(
                "done-btn"
            )
        ) {

            const taskId =
                Number(event.target.dataset.id);


            const task =
                tasks.find(function (item) {

                    return item.id === taskId;

                });


            if (task) {

                task.completed =
                    !task.completed;


                saveTasks();

                renderTasks();

            }


            return;

        }


        // =====================
        // DELETE
        // =====================

        if (
            event.target.classList.contains(
                "delete-btn"
            )
        ) {

            const taskId =
                Number(event.target.dataset.id);


            const confirmDelete =
                confirm(
                    "Yakin ingin menghapus tugas ini?"
                );


            if (!confirmDelete) {

                return;

            }


            tasks =
                tasks.filter(function (task) {

                    return task.id !== taskId;

                });


            saveTasks();

            renderTasks();

        }

    }
);


// =========================
// FILTER MENU
// =========================

filterBtn.addEventListener(
    "click",
    function () {

        filterMenu.classList.toggle(
            "active"
        );

    }
);


// =========================
// FILTER OPTIONS
// =========================

filterOptions.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function () {

                currentFilter =
                    option.dataset.filter;


                filterBtn.textContent =
                    option.textContent + " ▾";


                filterMenu.classList.remove(
                    "active"
                );


                applyTaskFilter();

            }
        );

    }
);


// =========================
// SEARCH
// =========================

searchInput.addEventListener(
    "input",
    function () {

        applyTaskFilter();

    }
);


// =========================
// SEARCH + FILTER
// =========================

function applyTaskFilter() {

    const keyword =
        searchInput.value
            .toLowerCase()
            .trim();


    const taskCards =
        document.querySelectorAll(
            ".task-card"
        );


    taskCards.forEach(
        function (card) {


            // =====================
            // DATA TASK
            // =====================

            const taskName =
                card.querySelector("h3")
                    .textContent
                    .toLowerCase();


            const taskSubject =
                card.querySelector(
                    ".task-category"
                )
                .textContent
                .toLowerCase();


            const matchesSearch =
                taskName.includes(keyword) ||
                taskSubject.includes(keyword);


            // =====================
            // FILTER
            // =====================

            let matchesFilter = true;


            // ALL
            if (
                currentFilter === "all"
            ) {

                matchesFilter = true;

            }


            // PENDING
            else if (
                currentFilter === "pending"
            ) {

                matchesFilter =
                    !card.classList.contains(
                        "completed"
                    );

            }


            // COMPLETED
            else if (
                currentFilter === "completed"
            ) {

                matchesFilter =
                    card.classList.contains(
                        "completed"
                    );

            }


            // OVERDUE
            else if (
                currentFilter === "overdue"
            ) {

                const deadline =
                    card.dataset.deadline;


                if (deadline) {

                    const today =
                        new Date();


                    today.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    const deadlineDate =
                        new Date(deadline);


                    matchesFilter =
                        deadlineDate < today &&
                        !card.classList.contains(
                            "completed"
                        );

                } else {

                    matchesFilter = false;

                }

            }


            // =====================
            // SHOW / HIDE
            // =====================

            if (
                matchesSearch &&
                matchesFilter
            ) {

                card.style.display =
                    "flex";

            } else {

                card.style.display =
                    "none";

            }

        }
    );

}


// =========================
// LOAD TASK
// =========================

renderTasks();