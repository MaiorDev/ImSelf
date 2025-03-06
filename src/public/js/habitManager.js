//Move habits

const habits = document.getElementsByClassName("habit");

for (let habit of habits) {
  // Añadir el evento de arrastre a cada elemento
  habit.addEventListener("dragstart", (e) => {
    // Verifica si el atributo id_habit existe en el elemento

    // Poner el id del hábito en el objeto de transferencia
    e.dataTransfer.setData("id", habit.id_habit);
    console.log("ID transferido:", habit.id_habit);
  });
}

//Add Habit with the form
const addHabit = document.getElementById("add-Habit");
const form = document.getElementById("container-form");

addHabit.addEventListener("click", () => {
  form.style.display = "flex";
});

document.getElementById("newHabitForm").addEventListener("submit", (e) => {
  const titleInput = document.getElementById("titleInput").value.trim();
  const descriptionInput = document
    .getElementById("descriptionInput")
    .value.trim();

  if (titleInput === "") {
    alert("please put a title");
    return;
  }

  fetch("/addHabit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: titleInput,
      description: descriptionInput,
    }),
  })
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
    });
});
