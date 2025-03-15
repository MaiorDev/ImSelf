//Move habits
let draggedHabit = null;

// make the habits draggable
const habits = document.querySelectorAll(".habit");
habits.forEach((habit) => {
  habit.addEventListener("dragstart", (event) => {
    draggedHabit = event.target; // save the habit being dragged
    event.target.classList.add("dragging"); // add a class to indicate the habit is being dragged
  });

  habit.addEventListener("dragend", () => {
    draggedHabit.classList.remove("dragging");
    draggedHabit.style.opacity = "1"; // Restore opacity
    draggedHabit = null;
  });
});

// make the areas droppable
document.querySelectorAll(".droppable").forEach((area) => {
  area.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.target.classList.add("drag-over");
  });
  area.addEventListener("dragleave", () => {
    event.target.classList.remove("drag-over");
  });
  area.addEventListener("drop", (event) => {
    event.preventDefault();
    event.target.classList.remove("drag-over");
    if (draggedHabit) {
      area.appendChild(draggedHabit);
      updateHabitStatus(draggedHabit.dataset.id, area.dataset.status);
      console.log(draggedHabit.dataset.id);
    }
  });
});

// Update the status of the habit
function updateHabitStatus(habitId, newStatus) {
  fetch(`/habitTracker/update-habit-status/${habitId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  })
    .then(() => {
      console.log("Habit updated");
    })
    .catch((error) => console.error("Error updating habit:", error));
}

//Add Habit with the form
const addHabit = document.getElementById("add-Habit");
const form = document.getElementById("container-form");
const titleInput = document.getElementById("titleInput");
const submitAddHabit = document.getElementById("submitAddHabit");
//open the form
addHabit.addEventListener("click", () => {
  form.style.display = "flex";
});

titleInput.addEventListener("input", (e) => {
  let titleValue = e.target.value;
  if (titleValue.length == 0) {
    submitAddHabit.disabled = true;
    submitAddHabit.style.opacity = "0.5";
    submitAddHabit.style.backgroundColor = "#666";
    submitAddHabit.style.cursor = "not-allowed";
  } else {
    submitAddHabit.disabled = false;
    submitAddHabit.style.opacity = "1";
    submitAddHabit.style.backgroundColor = "#0d7d69";
    submitAddHabit.style.cursor = "pointer";
  }

  if (titleValue.length > 25) {
    titleValue = titleValue.substring(0, 25);
    titleInput.value = titleValue;
  }
});
document.getElementById("newHabitForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("titleInput").value.trim();
  const descriptionInput = document
    .getElementById("descriptionInput")
    .value.trim();

  if (titleInput === "") {
    alert("please put a title");
    return;
  }

  fetch("/habitTracker/addHabit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: titleInput,
      description: descriptionInput,
    }),
  })
    .then(() => {
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
      window.location.reload();
    });
});

//close the form
document.getElementById("close-form").addEventListener("click", (e) => {
  e.stopPropagation();
  e.preventDefault();
  form.style.display = "none";
});

//interact with the habit
const infocard = document.getElementById("container-info-card");
const title = document.getElementById("title_info-card");
const description = document.getElementById("description_info-card");
const closeInfoCard = document.getElementById("close-info-card");
const edit = document.getElementById("edit-habit");

closeInfoCard.addEventListener("click", () => {
  infocard.style.display = "none";
});

habits.forEach((habit) => {
  habit.addEventListener("click", (e) => {
    infocard.style.display = "flex";
    title.value = habit.dataset.title;
    description.value = habit.dataset.description;
    infocard.dataset.id = habit.dataset.id;
  });
});

//edit habit button
title.addEventListener("input", (e) => {
  let titleValue = e.target.value;
  if (titleValue.length == 0) {
    edit.style.display = "none";
  } else {
    edit.style.display = "block";
  }

  if (titleValue.length > 25) {
    titleValue = titleValue.substring(0, 25);
    title.value = titleValue;
  }
});

title.addEventListener("keypress", (e) => {
  edit.style.display = "block";
});
description.addEventListener("keypress", (e) => {
  edit.style.display = "block";
});
// Edit habit
edit.addEventListener("click", () => {
  const newDescription = description.value;
  const newTitle = title.value;
  const id = infocard.dataset.id;

  fetch(`/habitTracker/update-habit-data/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description: newDescription, title: newTitle }),
  })
    .then(() => {
      console.log("Description updated");
      window.location.reload();
    })
    .catch((error) => console.error("Error updating description:", error));
});
//delete habit
const deleteHabit = document.getElementById("delete-habit");
deleteHabit.addEventListener("click", () => {
  const id = infocard.dataset.id;
  fetch(`/habitTracker/delete-habit/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      console.log("Habit deleted");
      window.location.reload();
    })
    .catch((error) => console.error("Error deleting habit:", error));
});
