// subjects.js - Maneja la funcionalidad relacionada con las asignaturas

// Función para inicializar la funcionalidad de agregar asignaturas
function initAddSubject() {
  const addSubjectBtn = document.querySelector(".school__heading button");

  addSubjectBtn.addEventListener("click", function () {
    // Create modal for adding new subject
    const modal = document.createElement("div");
    modal.className = "subject-modal";

    modal.innerHTML = `
      <div class="subject-modal__content">
        <h2>Add New Subject</h2>
        <form id="subjectForm" action="/school/addSubject" method="POST">
          <div class="form-group">
            <label for="name">Subject Name</label>
            <input type="text" id="name" name="name" >
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="5"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn" id="submit-btn" disabled>Add Subject</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal on cancel
    modal.querySelector(".cancel-btn").addEventListener("click", function () {
      document.body.removeChild(modal);
    });

    // Add form validation after the form is added to the DOM
    const nameInput = document.getElementById("name");
    const descriptionInput = document.getElementById("description");
    const submitBtn = document.getElementById("submit-btn");

    // Function to validate form
    const validateForm = () => {
      if (
        nameInput.value.trim() === "" ||
        descriptionInput.value.trim() === ""
      ) {
        submitBtn.style.backgroundColor = "#555";
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";
        submitBtn.style.boxShadow = "none";
        submitBtn.style.transform = "scale(0.98)";
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

    descriptionInput.addEventListener("input", validateForm);
    nameInput.addEventListener("input", validateForm);

    //Validate form length
    function validateLength(input) {
      let maxLength;
      if (input === descriptionInput) {
        maxLength = 280;
      } else if (input === nameInput) {
        maxLength = 26;
      }
      const currentLength = input.value.length;
      if (currentLength > maxLength) {
        input.value = input.value.slice(0, maxLength);
      }
    }

    // Add event listeners to input fields
    descriptionInput.addEventListener("input", function () {
      validateLength(descriptionInput);
    });

    nameInput.addEventListener("input", function () {
      validateLength(nameInput);
    });
  });
}

// Función para inicializar la funcionalidad de eliminar asignaturas
function initDeleteSubject() {
  const deleteButtons = document.querySelectorAll(
    ".school__content__subject button"
  );

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const subjectItem = this.closest(".school__content__subject");
      const subjectId = subjectItem.dataset.id;

      if (confirm("Are you sure you want to delete this subject?")) {
        fetch(`/school/deleteSubject/${subjectId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then(() => {
            subjectItem.remove();
            return { success: true };
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Failed to delete subject");
          });
      }
    });
  });
}

// Exportar las funciones para usarlas en school.js
export { initAddSubject, initDeleteSubject };
