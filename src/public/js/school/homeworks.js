// homeworks.js - Maneja la funcionalidad relacionada con las tareas

// Función para crear el modal de tareas
function createHomeworksModal(subject, data) {
  const modal = document.createElement("div");
  modal.className = "homeworks-modal";

  modal.innerHTML = `
    <div class="homework-modal__content" id="homeworks-modal">  
      <button id="add-homework-btn"><img src="/assets/add.png"></button>
      <button id="close-btn"><img src="/assets/close.png"></button> 
      <h2>${subject}</h2>
      <div class="homework-modal__content__homework">
        <ul></ul>
      </div>
    </div>
  `;

  const homeworkList = modal.querySelector(
    ".homework-modal__content__homework ul"
  );

  if (data.homework && data.homework.length > 0) {
    data.homework.forEach((homework) => {
      homeworkList.innerHTML += `
        <li>
          <button data-id="${homework.id_homework}" class="delete-homework-btn"><img src="/assets/delete.png"></button>
          <button data-id="${homework.id_homework}" class="edit-homework-btn"><img src="/assets/edit.png"></button>
          <h3>${homework.title_hw}</h3>
          <p>${homework.description_hw}</p>
          <p id="due-date_hw">Due Date: ${homework.due_date_hw}</p>
        </li>`;
    });
  } else {
    homeworkList.innerHTML = `<p>No homework available for this subject.</p>`;
  }

  document.body.appendChild(modal);

  // Configurar botones y eventos
  setupHomeworkModalEvents(modal, subject);

  return modal;
}

// Configurar eventos para el modal de tareas
function setupHomeworkModalEvents(modal, subject) {
  const closeBtn = modal.querySelector("#close-btn");
  const addHomeworkBtn = modal.querySelector("#add-homework-btn");

  // Cerrar modal
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Configurar botones de edición
  setupEditHomeworkButtons(modal);

  // Configurar botones de eliminación
  setupDeleteHomeworkButtons(modal);

  // Configurar botón de agregar tarea
  setupAddHomeworkButton(addHomeworkBtn, subject);
}

// Configurar botones de edición de tareas
function setupEditHomeworkButtons(modal) {
  const editHomeworkBtns = modal.querySelectorAll(".edit-homework-btn");

  editHomeworkBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const homeworkItem = this.closest("li");
      const homeworkId = this.dataset.id;
      const title = homeworkItem.querySelector("h3").textContent;
      const description = homeworkItem.querySelector("p").textContent;
      const dueDate = homeworkItem.querySelector("#due-date_hw").textContent;

      // Crear modal para editar tarea
      createEditHomeworkModal(homeworkId, title, description, dueDate);
    });
  });
}

// Crear modal para editar tarea
function createEditHomeworkModal(homeworkId, title, description, dueDate) {
  const homeworkModal = document.createElement("div");
  homeworkModal.className = "homework-modal";

  homeworkModal.innerHTML = `
    <div id="add-homework-container">
      <div id="add-homework-content-form">
        <h2>Edit Homework</h2>
        <form id="homeworkForm" action="/school/editHomework" method="POST">
          <div class="form-group">
            <label for="title_hw">Title</label>
            <input type="text" id="title_hw" name="title_hw" value="${title}">
          </div>
          <div class="form-group">
            <label for="description_hw">Description</label>
            <textarea id="description_hw" name="description_hw" rows="5">${description}</textarea>
          </div>
          <div class="form-group">
            <label for="due_date">Due Date</label>
            <input type="date" id="due_date" name="due_date" value="${formatDateForInput(
              dueDate.replace("Due Date: ", "")
            )}">
          </div>
          <input type="hidden" name="homeworkId" value="${homeworkId}">
          <div class="form-actions">
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn" id="homework-submit-btn">Update Homework</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(homeworkModal);

  // Configurar validación y eventos del formulario
  setupEditHomeworkForm(homeworkModal, homeworkId);
}

// Configurar formulario de edición de tarea
function setupEditHomeworkForm(modal, homeworkId) {
  const editTitleInput = modal.querySelector("#title_hw");
  const editDescriptionInput = modal.querySelector("#description_hw");
  const editDueDateInput = modal.querySelector("#due_date");
  const editSubmitBtn = modal.querySelector("#homework-submit-btn");

  // Función para validar formulario
  const validateEditForm = () => {
    if (
      editTitleInput.value.trim() === "" ||
      editDescriptionInput.value.trim() === "" ||
      editDueDateInput.value.trim() === ""
    ) {
      editSubmitBtn.style.backgroundColor = "#555";
      editSubmitBtn.style.opacity = "0.6";
      editSubmitBtn.style.cursor = "not-allowed";
      editSubmitBtn.style.boxShadow = "none";
      editSubmitBtn.style.transform = "scale(0.98)";
      editSubmitBtn.disabled = true;
    } else {
      editSubmitBtn.style.backgroundColor = "#08a88a";
      editSubmitBtn.style.opacity = "1";
      editSubmitBtn.style.cursor = "pointer";
      editSubmitBtn.style.boxShadow = "0 4px 12px rgba(8, 168, 138, 0.3)";
      editSubmitBtn.style.transform = "scale(1)";
      editSubmitBtn.disabled = false;
    }
  };

  // Agregar event listeners
  editTitleInput.addEventListener("input", validateEditForm);
  editDescriptionInput.addEventListener("input", validateEditForm);
  editDueDateInput.addEventListener("input", validateEditForm);

  // Ejecutar validación inicial
  validateEditForm();

  // validate length
  let maxLength = 0;
  const validateLength = (input) => {
    if (input == editDescriptionInput) {
      maxLength = 200;
    } else if (input == editTitleInput) {
      maxLength = 35;
    }
    const currentLength = input.value.length;
    if (currentLength > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  };
  editDescriptionInput.addEventListener("input", () =>
    validateLength(editDescriptionInput)
  );
  editTitleInput.addEventListener("input", () =>
    validateLength(editTitleInput)
  );
  // Configurar botón de cancelar
  const cancelBtn = modal.querySelector("#cancel-btn");
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Manejar envío del formulario
  const homeworkForm = modal.querySelector("#homeworkForm");
  homeworkForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const title = editTitleInput.value;
    const description = editDescriptionInput.value;
    const dueDate = editDueDateInput.value;

    fetch(`/school/editHomework/${homeworkId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        description: description,
        dueDate: dueDate,
      }),
    }).then(() => {
      document.body.removeChild(modal);
      location.reload();
    });
  });
}

// Configurar botones de eliminación de tareas
function setupDeleteHomeworkButtons(modal) {
  const deleteHomeworkBtns = modal.querySelectorAll(".delete-homework-btn");

  deleteHomeworkBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const homeworkItem = this.closest("li");
      const homeworkId = this.dataset.id;

      if (confirm("Are you sure you want to delete this homework?")) {
        fetch(`/school/deleteHomework/${homeworkId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              homeworkItem.remove();
              return { success: true };
            }
            return response.json();
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Failed to delete homework");
          });
      }
    });
  });
}

// Configurar botón de agregar tarea
function setupAddHomeworkButton(addHomeworkBtn, subject) {
  addHomeworkBtn.addEventListener("click", () => {
    createAddHomeworkModal(subject);
  });
}

// Crear modal para agregar tarea
function createAddHomeworkModal(subject) {
  const homeworkModal = document.createElement("div");
  homeworkModal.className = "homework-modal";

  homeworkModal.innerHTML = `
    <div id="add-homework-container">  
      <div id="add-homework-content-form">
        <h2>Add New Homework</h2>
        <form id="homeworkForm" action="/school/addHomework" method="POST">
          <div class="form-group">
            <label for="title_hw">Title</label>
            <input type="text" id="title_hw" name="title_hw">
          </div>
          <div class="form-group">
            <label for="description_hw">Description</label>
            <textarea id="description_hw" name="description_hw" rows="5"></textarea>
          </div>
          <div class="form-group">
            <label for="due_date">Due Date</label>
            <input type="date" id="due_date" name="due_date">
          </div>
          <input type="hidden" name="subject" id="subject_name" value="${subject}">
          <div class="form-actions">
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn" id="homework-submit-btn" disabled="true">Add Homework</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(homeworkModal);

  // Configurar validación y eventos del formulario
  setupAddHomeworkForm(homeworkModal, subject);
}

// Configurar formulario de agregar tarea
function setupAddHomeworkForm(modal, subject) {
  const submitBtn = modal.querySelector("#homework-submit-btn");
  const cancelBtn = modal.querySelector("#cancel-btn");
  const titleInput = modal.querySelector("#title_hw");
  const descriptionInput = modal.querySelector("#description_hw");
  const dueDateInput = modal.querySelector("#due_date");

  // Cerrar modal
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Función para validar formulario
  const validateForm = () => {
    if (
      titleInput.value.trim() === "" ||
      descriptionInput.value.trim() === "" ||
      dueDateInput.value.trim() === ""
    ) {
      submitBtn.style.backgroundColor = "#555";
      submitBtn.style.opacity = "0.6";
      submitBtn.style.cursor = "not-allowed";
      submitBtn.style.boxShadow = "none";
      submitBtn.disabled = true;
    } else {
      submitBtn.style.backgroundColor = "#08a88a";
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
      submitBtn.style.boxShadow = "0 4px 12px rgba(8, 168, 138, 0.3)";
      submitBtn.style.transform = "scale(1)";
      submitBtn.disabled = false;
    }
  };

  // Agregar event listeners
  descriptionInput.addEventListener("input", validateForm);
  titleInput.addEventListener("input", validateForm);
  dueDateInput.addEventListener("input", validateForm);

  // validate length
  let maxLength = 0;
  const validateLength = (input) => {
    if (input == descriptionInput) {
      maxLength = 200;
    } else if (input == titleInput) {
      maxLength = 35;
    }
    const currentLength = input.value.length;
    if (currentLength > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  };
  descriptionInput.addEventListener("input", () =>
    validateLength(descriptionInput)
  );
  titleInput.addEventListener("input", () => validateLength(titleInput));

  // Manejar envío del formulario
  const homeworkForm = modal.querySelector("#homeworkForm");
  homeworkForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const title = titleInput.value;
    const description = descriptionInput.value;
    const dueDate = dueDateInput.value;

    fetch(`/school/addHomework/${subject}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        dueDate,
      }),
    })
      .then((response) => {
        if (response.ok) {
          document.body.removeChild(modal);
          location.reload();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

// Función auxiliar para formatear fechas para input type="date"
function formatDateForInput(dateString) {
  try {
    // Si ya tiene formato YYYY-MM-DD, devolverlo tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Intentar convertir de formato DD/MM/YYYY o similar
    const parts = dateString.split(/[\/\-\.]/);
    if (parts.length === 3) {
      // Determinar el formato basado en el tamaño de las partes
      let year, month, day;

      // Si la primera parte tiene 4 dígitos, asumimos YYYY-MM-DD
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1].padStart(2, "0");
        day = parts[2].padStart(2, "0");
      } else {
        // Asumimos DD-MM-YYYY o MM-DD-YYYY (más común DD-MM-YYYY fuera de USA)
        day = parts[0].padStart(2, "0");
        month = parts[1].padStart(2, "0");
        year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      }

      return `${year}-${month}-${day}`;
    }

    // Si no se puede parsear, intentar con Date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    // Si todo falla, devolver fecha actual
    return new Date().toISOString().split("T")[0];
  } catch (e) {
    console.error("Error formatting date:", e);
    return new Date().toISOString().split("T")[0];
  }
}

// Exportar funciones para usarlas en school.js
export { createHomeworksModal };
