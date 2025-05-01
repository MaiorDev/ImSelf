// Function to initialize the add subject functionality
function initAddNote() {
  const addSubjectBtn = document.querySelector(".school__heading button");

  addSubjectBtn.addEventListener("click", function () {
    // Create modal for adding new subject
    const modal = document.createElement("div");
    modal.className = "subject-modal";

    modal.innerHTML = `
      <div class="subject-modal__content">
        <h2>Add New Subject</h2>
        <form id="subjectForm" action="/notes/addNote" method="POST">
          <div class="form-group">
            <label for="name">Subject Name</label>
            <input type="text" id="name" name="title" >
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
    const subjectForm = document.getElementById("subjectForm");
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

    function getUserEmailFromURL() {
      const pathParts = window.location.pathname.split("/");
      return pathParts[pathParts.length - 1]; // Get the last part of the URL which should be the email
    }
    subjectForm.addEventListener("submit", (e) => {
      e.preventDefault();
      fetch("/notes/addNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput.value,
          text: descriptionInput.value,
          email: getUserEmailFromURL(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = `/notes/${getUserEmailFromURL()}`;
          } else {
            alert("Failed to add note");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to add note");
        });
    });
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

// Function to initialize the delete subject functionality
function initDeleteNote() {
  const deleteButtons = document.querySelectorAll(
    ".school__content__subject button"
  );

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const noteItem = this.closest(".school__content__subject");
      const noteId = noteItem.dataset.id;

      if (confirm("Are you sure you want to delete this note?")) {
        fetch(`/notes/deleteNote/${noteId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            if (data.success) {
              noteItem.remove();
            } else {
              alert("Failed to delete note: " + data.message);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Failed to delete note");
          });
      }
    });
  });
}

// Export functions to use in school.js
export { initAddNote, initDeleteNote };
