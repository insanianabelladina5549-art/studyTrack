/* =========================
   ELEMENT
========================= */

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


/* =========================
   DETAIL MODAL ELEMENT
========================= */

const detailModal = document.getElementById("detailModal");
const closeDetailModal = document.getElementById("closeDetailModal");

const detailTitle = document.getElementById("detailTitle");
const detailSubject = document.getElementById("detailSubject");
const detailDeadline = document.getElementById("detailDeadline");
const detailStatus = document.getElementById("detailStatus");
const detailType = document.getElementById("detailType");

const detailNote = document.getElementById("detailNote");
const detailNoteBox = document.getElementById("detailNoteBox");

const detailFileBox = document.getElementById("detailFileBox");
const detailFileName = document.getElementById("detailFileName");
const detailFileBtn = document.getElementById("detailFileBtn");

const detailPreview = document.getElementById("detailPreview");
const detailPreviewContent = document.getElementById("detailPreviewContent");

let currentFileURL = null;

const detailLinkBox = document.getElementById("detailLinkBox");
const detailLinkBtn = document.getElementById("detailLinkBtn");

const detailDoneBtn = document.getElementById("detailDoneBtn");
const detailDeleteBtn = document.getElementById("detailDeleteBtn");


/* =========================
   DATA TASK
========================= */

let tasks = [];

try {
    tasks = JSON.parse(
        localStorage.getItem("studyTrackTasks")
    ) || [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {

    console.error(
        "Data task tidak bisa dibaca:",
        error
    );

    tasks = [];
}


let currentFilter = "all";
let selectedTaskId = null;


/* =========================
   OPEN ADD TASK MODAL
========================= */

addTaskBtn.addEventListener(
    "click",
    function () {

        taskModal.classList.add("active");

    }
);


/* =========================
   CLOSE ADD TASK MODAL
========================= */

closeModal.addEventListener(
    "click",
    function () {

        taskModal.classList.remove("active");

    }
);


cancelBtn.addEventListener(
    "click",
    function () {

        taskModal.classList.remove("active");

    }
);


/* =========================
   CLOSE ADD MODAL OUTSIDE
========================= */

taskModal.addEventListener(
    "click",
    function (event) {

        if (event.target === taskModal) {

            taskModal.classList.remove("active");

        }

    }
);


/* =========================
   CLOSE DETAIL MODAL
========================= */

closeDetailModal.addEventListener(
    "click",
    function () {

        detailModal.classList.remove("active");

        selectedTaskId = null;

    }
);


/* =========================
   CLOSE DETAIL MODAL OUTSIDE
========================= */

detailModal.addEventListener(
    "click",
    function (event) {

        if (event.target === detailModal) {

            detailModal.classList.remove("active");

            selectedTaskId = null;

        }

    }
);


/* =========================
   ESC KEY
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }

        taskModal.classList.remove("active");

        detailModal.classList.remove("active");

        selectedTaskId = null;

    }
);


/* =========================
   CONVERT FILE TO BASE64
========================= */

function fileToBase64(file) {

    return new Promise(
        function (resolve, reject) {

            const reader = new FileReader();

            reader.onload = function () {

                resolve(reader.result);

            };

            reader.onerror = function (error) {

                reject(error);

            };

            reader.readAsDataURL(file);

        }
    );

}

/* =========================
   CREATE FILE URL
========================= */

function createFileURL(file) {

    const parts = file.data.split(",");

    const base64Data = parts[1];

    const byteCharacters = atob(base64Data);

    const byteNumbers = new Array(
        byteCharacters.length
    );

    for (
        let i = 0;
        i < byteCharacters.length;
        i++
    ) {

        byteNumbers[i] =
            byteCharacters.charCodeAt(i);

    }

    const byteArray =
        new Uint8Array(byteNumbers);

    const blob =
        new Blob(
            [byteArray],
            {
                type: file.type
            }
        );

    return URL.createObjectURL(blob);
}


/* =========================
   SAVE TO LOCAL STORAGE
========================= */

function saveTasks() {

    try {

        localStorage.setItem(
            "studyTrackTasks",
            JSON.stringify(tasks)
        );

        return true;

    } catch (error) {

        console.error(error);

        alert(
            "Penyimpanan browser penuh. Coba hapus beberapa tugas atau file."
        );

        return false;

    }

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   VALIDATE URL
========================= */

function safeURL(url) {

    if (!url) {
        return "";
    }

    try {

        const parsed = new URL(url);

        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {

            return parsed.href;

        }

    } catch (error) {

        return "";

    }

    return "";

}


/* =========================
   SAVE TASK
========================= */

taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const taskName =
            document.getElementById("taskName").value.trim();

        const taskSubject =
            document.getElementById("taskSubject").value.trim();

        const taskDeadline =
            document.getElementById("taskDeadline").value;

        const taskType =
            document.getElementById("taskType").value;

        const taskLink =
            document.getElementById("taskLink").value.trim();

        const taskNote =
            document.getElementById("taskNote").value.trim();

        const taskFile =
            document.getElementById("taskImage").files[0];


        /* =========================
           FILE DATA
        ========================= */

        let fileData = null;

        if (taskFile) {

            const maxSize = 3 * 1024 * 1024;

            if (taskFile.size > maxSize) {

                alert(
                    "Ukuran file terlalu besar. Maksimal 3 MB."
                );

                return;

            }


            const allowedImage =
                taskFile.type.startsWith("image/");

            const allowedPDF =
                taskFile.type === "application/pdf";


            if (
                !allowedImage &&
                !allowedPDF
            ) {

                alert(
                    "File harus berupa gambar atau PDF."
                );

                return;

            }


            try {

                const base64Data =
                    await fileToBase64(taskFile);

                fileData = {

                    name: taskFile.name,

                    type: taskFile.type,

                    size: taskFile.size,

                    data: base64Data

                };

            } catch (error) {

                console.error(error);

                alert(
                    "File gagal dibaca."
                );

                return;

            }

        }


        /* =========================
           VALIDATE LINK
        ========================= */

        let cleanLink = "";

        if (taskLink) {

            cleanLink = safeURL(taskLink);

            if (!cleanLink) {

                alert(
                    "Link pengumpulan tidak valid."
                );

                return;

            }

        }


        /* =========================
           CREATE TASK
        ========================= */

        const newTask = {

            id: Date.now(),

            name: taskName,

            subject: taskSubject,

            deadline: taskDeadline,

            type: taskType,

            link: cleanLink,

            note: taskNote,

            file: fileData,

            completed: false

        };


        /* =========================
           ADD TASK
        ========================= */

        tasks.push(newTask);


        /* =========================
           SAVE
        ========================= */

        const saved = saveTasks();

        if (!saved) {

            tasks.pop();

            return;

        }


        /* =========================
           RENDER
        ========================= */

        renderTasks();


        /* =========================
           RESET FORM
        ========================= */

        taskForm.reset();


        /* =========================
           CLOSE MODAL
        ========================= */

        taskModal.classList.remove("active");

    }
);


/* =========================
   RENDER TASK
========================= */

function renderTasks() {

    taskList.innerHTML = "";


    /* =========================
       EMPTY
    ========================= */

    if (tasks.length === 0) {

        taskList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🌱
                </div>

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Add your first task and keep everything organized.
                </p>

            </div>

        `;

        updateStats();

        return;

    }


    /* =========================
       CREATE CARD
    ========================= */

    tasks.forEach(
        function (task) {

            const taskCard =
                document.createElement("div");


            taskCard.classList.add("task-card");


            taskCard.dataset.id =
                task.id;


            taskCard.dataset.deadline =
                task.deadline || "";


            /* =========================
               COMPLETED
            ========================= */

            if (task.completed) {

                taskCard.classList.add("completed");

            }


            /* =========================
               FILE INDICATOR
            ========================= */

            let fileIndicator = "📄";

            if (task.file) {

                if (
                    task.file.type &&
                    task.file.type.startsWith("image/")
                ) {

                    fileIndicator = "🖼️";

                } else if (
                    task.file.type ===
                    "application/pdf"
                ) {

                    fileIndicator = "📕";

                }

            }


            /* =========================
               CARD HTML
            ========================= */

            taskCard.innerHTML = `

                <div class="task-image">
                    📚
                </div>

                <div class="task-content">

                    <p class="task-category">
                        ${escapeHTML(task.subject)}
                    </p>

                    <h3>
                        ${escapeHTML(task.name)}
                    </h3>

                    <div class="task-info">

                        <span>
                            📅
                            ${formatDate(task.deadline)}
                        </span>

                        <span>
                            ${fileIndicator}
                            ${escapeHTML(task.type)}
                        </span>

                    </div>

                </div>

                <div class="task-actions">

                    <button
                        class="done-btn"
                        data-id="${task.id}"
                        type="button"
                    >
                        ${
                            task.completed
                                ? "✓ Completed"
                                : "○ Done"
                        }
                    </button>

                    <button
                        class="delete-btn"
                        data-id="${task.id}"
                        type="button"
                    >
                        🗑️
                    </button>

                </div>

            `;


            taskList.appendChild(taskCard);

        }
    );


    updateStats();

    applyTaskFilter();

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(date) {

    if (!date) {

        return "-";

    }


    const dateObject =
        new Date(date + "T00:00:00");


    if (
        isNaN(dateObject.getTime())
    ) {

        return "-";

    }


    return dateObject.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================
   UPDATE STATS
========================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    const pending =
        total - completed;


    document.getElementById(
        "totalTasks"
    ).textContent = total;


    document.getElementById(
        "pendingTasks"
    ).textContent = pending;


    document.getElementById(
        "completedTasks"
    ).textContent = completed;

}


/* =========================
   OPEN TASK DETAIL
========================= */

function openTaskDetail(taskId) {

    const task =
        tasks.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(taskId)
                );

            }
        );


    if (!task) {

        return;

    }


    selectedTaskId = task.id;


    /* =========================
       BASIC INFORMATION
    ========================= */

    detailTitle.textContent =
        task.name || "Untitled Task";


    detailSubject.textContent =
        task.subject || "-";


    detailDeadline.textContent =
        formatDate(task.deadline);


    detailType.textContent =
        task.type || "-";


    /* =========================
       STATUS
    ========================= */

    if (task.completed) {

        detailStatus.textContent =
            "✓ Completed";

        detailDoneBtn.textContent =
            "↩ Mark as Pending";

    } else {

        detailStatus.textContent =
            "○ Pending";

        detailDoneBtn.textContent =
            "✓ Mark as Done";

    }


    /* =========================
       NOTE
    ========================= */

    if (
        task.note &&
        task.note.trim()
    ) {

        detailNoteBox.style.display =
            "block";

        detailNote.textContent =
            task.note;

    } else {

        detailNoteBox.style.display =
            "none";

    }


    /* =========================
   FILE
========================= */

if (currentFileURL) {

    URL.revokeObjectURL(
        currentFileURL
    );

    currentFileURL = null;

}


if (
    task.file &&
    task.file.data
) {

    detailFileBox.style.display =
        "flex";


    detailFileName.textContent =
        task.file.name ||
        "File tugas";


    /* =========================
       CREATE BLOB URL
    ========================= */

    currentFileURL =
        createFileURL(task.file);


    detailFileBtn.href =
        currentFileURL;


    detailFileBtn.textContent =
        task.file.type === "application/pdf"
            ? "Open PDF"
            : "View File";


    detailFileBtn.target =
        "_blank";


    /* =========================
       SHOW PREVIEW
    ========================= */

    detailPreview.style.display =
        "block";


    detailPreviewContent.innerHTML =
        "";


    /* =========================
       IMAGE PREVIEW
    ========================= */

    if (
        task.file.type &&
        task.file.type.startsWith("image/")
    ) {

        const image =
            document.createElement("img");

        image.src =
            currentFileURL;

        image.alt =
            task.file.name ||
            "Preview file";

        image.className =
            "detail-preview-image";

        detailPreviewContent.appendChild(
            image
        );

    }


    /* =========================
       PDF PREVIEW
    ========================= */

    else if (
        task.file.type ===
        "application/pdf"
    ) {

        const iframe =
            document.createElement("iframe");

        iframe.src =
            currentFileURL;

        iframe.className =
            "detail-preview-pdf";

        iframe.title =
            task.file.name ||
            "PDF Preview";

        detailPreviewContent.appendChild(
            iframe
        );

    }

} else {

    detailFileBox.style.display =
        "none";


    detailFileBtn.removeAttribute(
        "href"
    );


    detailPreview.style.display =
        "none";


    detailPreviewContent.innerHTML =
        "";

}


    /* =========================
       LINK
    ========================= */

    if (task.link) {

        const cleanLink =
            safeURL(task.link);


        if (cleanLink) {

            detailLinkBox.style.display =
                "flex";


            detailLinkBtn.href =
                cleanLink;


            detailLinkBtn.target =
                "_blank";

        } else {

            detailLinkBox.style.display =
                "none";

        }

    } else {

        detailLinkBox.style.display =
            "none";


        detailLinkBtn.removeAttribute(
            "href"
        );

    }


    /* =========================
       SHOW DETAIL MODAL
    ========================= */

    detailModal.classList.add("active");

}


/* =========================
   TASK CARD CLICK
========================= */

taskList.addEventListener(
    "click",
    function (event) {

        /* =========================
           DONE BUTTON
        ========================= */

        const doneButton =
            event.target.closest(".done-btn");


        if (doneButton) {

            const taskId =
                Number(doneButton.dataset.id);


            toggleTaskComplete(taskId);

            return;

        }


        /* =========================
           DELETE BUTTON
        ========================= */

        const deleteButton =
            event.target.closest(".delete-btn");


        if (deleteButton) {

            const taskId =
                Number(deleteButton.dataset.id);


            deleteTask(taskId);

            return;

        }


        /* =========================
           OPEN DETAIL
        ========================= */

        const card =
            event.target.closest(".task-card");


        if (card) {

            const taskId =
                Number(card.dataset.id);


            openTaskDetail(taskId);

        }

    }
);


/* =========================
   TOGGLE COMPLETE
========================= */

function toggleTaskComplete(taskId) {

    const task =
        tasks.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(taskId)
                );

            }
        );


    if (!task) {

        return;

    }


    task.completed =
        !task.completed;


    if (saveTasks()) {

        renderTasks();

    }

}


/* =========================
   DELETE TASK
========================= */

function deleteTask(taskId) {

    const task =
        tasks.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(taskId)
                );

            }
        );


    if (!task) {

        return;

    }


    const confirmDelete =
        confirm(
            `Yakin ingin menghapus "${task.name}"?`
        );


    if (!confirmDelete) {

        return;

    }


    tasks =
        tasks.filter(
            function (item) {

                return (
                    Number(item.id) !==
                    Number(taskId)
                );

            }
        );


    if (saveTasks()) {

        renderTasks();


        if (
            Number(selectedTaskId) ===
            Number(taskId)
        ) {

            detailModal.classList.remove(
                "active"
            );

            selectedTaskId = null;

        }

    }

}


/* =========================
   DETAIL DONE BUTTON
========================= */

detailDoneBtn.addEventListener(
    "click",
    function () {

        if (
            selectedTaskId === null
        ) {

            return;

        }


        const taskId =
            selectedTaskId;


        toggleTaskComplete(taskId);


        const task =
            tasks.find(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(taskId)
                    );

                }
            );


        if (task) {

            openTaskDetail(task.id);

        }

    }
);


/* =========================
   DETAIL DELETE BUTTON
========================= */

detailDeleteBtn.addEventListener(
    "click",
    function () {

        if (
            selectedTaskId === null
        ) {

            return;

        }


        deleteTask(selectedTaskId);

    }
);


/* =========================
   FILTER MENU
========================= */

filterBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();


        filterMenu.classList.toggle(
            "active"
        );

    }
);


/* =========================
   FILTER OPTIONS
========================= */

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


/* =========================
   CLOSE FILTER OUTSIDE
========================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".filter-wrapper"
            )
        ) {

            filterMenu.classList.remove(
                "active"
            );

        }

    }
);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    function () {

        applyTaskFilter();

    }
);


/* =========================
   SEARCH + FILTER
========================= */

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

            const taskId =
                Number(card.dataset.id);


            const task =
                tasks.find(
                    function (item) {

                        return (
                            Number(item.id) ===
                            taskId
                        );

                    }
                );


            if (!task) {

                card.style.display =
                    "none";

                return;

            }


            /* =========================
               SEARCH
            ========================= */

            const taskName =
                (task.name || "")
                    .toLowerCase();


            const taskSubject =
                (task.subject || "")
                    .toLowerCase();


            const matchesSearch =
                taskName.includes(keyword) ||
                taskSubject.includes(keyword);


            /* =========================
               FILTER
            ========================= */

            let matchesFilter = true;


            if (
                currentFilter ===
                "pending"
            ) {

                matchesFilter =
                    !task.completed;

            }


            else if (
                currentFilter ===
                "completed"
            ) {

                matchesFilter =
                    task.completed;

            }


            else if (
                currentFilter ===
                "overdue"
            ) {

                if (task.deadline) {

                    const today =
                        new Date();


                    today.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    const deadlineDate =
                        new Date(
                            task.deadline +
                            "T00:00:00"
                        );


                    matchesFilter =
                        deadlineDate < today &&
                        !task.completed;

                } else {

                    matchesFilter = false;

                }

            }


            /* =========================
               SHOW / HIDE
            ========================= */

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


/* =========================
   LOAD TASK
========================= */

renderTasks();