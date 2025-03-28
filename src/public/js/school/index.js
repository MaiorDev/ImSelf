// school.js - Archivo principal que importa los módulos

// Importar funciones de los módulos
import { initAddSubject, initDeleteSubject } from "./subjects.js";
import { createHomeworksModal } from "./homeworks.js";

// Función de inicialización principal
function initSchool() {
  // Inicializar funcionalidad de asignaturas
  initAddSubject();
  initDeleteSubject();

  // Inicializar acceso a tareas de asignaturas
  initSubjectHomeworks();
}

// Inicializar acceso a tareas de asignaturas
function initSubjectHomeworks() {
  const subjectItems = document.querySelectorAll(".school__content__subject");

  subjectItems.forEach((subjectItem) => {
    subjectItem.addEventListener("click", function () {
      const subject = this.dataset.name;

      // Obtener tareas para la asignatura seleccionada
      fetch(`/school/homework/${subject}`)
        .then((response) => response.json())
        .then((data) => {
          // Crear modal de tareas
          createHomeworksModal(subject, data);
        })
        .catch((error) => {
          console.error("Error fetching homework:", error);
          alert("Failed to load homework data");
        });
    });
  });
}

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", initSchool);

// Para compatibilidad con navegadores antiguos o scripts que no soporten módulos
window.initSchool = initSchool;
