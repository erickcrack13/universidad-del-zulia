document.addEventListener('DOMContentLoaded', () => {

    // --- Base de datos simulada (solo para inicialización) ---
    // La función initializeDB() se ejecuta desde sim-database.js

    // --- Elementos del DOM ---
    const authSection = document.getElementById('auth-section');
    const contentSection = document.getElementById('content-section');
    const passwordInput = document.getElementById('password');
    const authBtn = document.getElementById('auth-btn');

    // --- Elementos de Gestión de Precios ---
    const priceInput = document.getElementById('price-inscription');
    const savePriceBtn = document.getElementById('save-price-btn');
    const feedbackPrice = document.getElementById('feedback-price');

    // --- Elementos de Gestión de Estudiantes ---
    const studentForm = document.getElementById('student-form');
    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const gradesContainer = document.getElementById('grades-container');
    const addGradeBtn = document.getElementById('add-grade-btn');
    const studentList = document.getElementById('student-list');

    // --- Contraseña ---
    const ADMIN_PASSWORD = 'luz2024';

    // --- Lógica de Autenticación ---
    authBtn.addEventListener('click', () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            authSection.style.display = 'none';
            contentSection.style.display = 'block';
            loadInitialData();
        } else {
            alert('Contraseña incorrecta.');
        }
    });
    passwordInput.addEventListener('keydown', (e) => e.key === 'Enter' && authBtn.click());

    // --- Carga de Datos Inicial ---
    const loadInitialData = () => {
        loadCurrentPrice();
        renderStudentList();
        addGradeField(); // Añade el primer campo de materia/nota
    };

    // --- Lógica de Gestión de Precios ---
    const loadCurrentPrice = () => {
        const currentPrice = localStorage.getItem('inscriptionPrice') || '100';
        priceInput.value = currentPrice;
    };

    savePriceBtn.addEventListener('click', () => {
        const newPrice = priceInput.value.trim();
        if (newPrice && !isNaN(newPrice)) {
            localStorage.setItem('inscriptionPrice', newPrice);
            feedbackPrice.textContent = `¡Guardado! El nuevo precio es ${newPrice} USD.`;
            feedbackPrice.style.color = 'green';
        } else {
            feedbackPrice.textContent = 'Por favor, introduce un número válido.';
            feedbackPrice.style.color = 'red';
        }
    });

    // --- Lógica de Gestión de Estudiantes ---
    const getStudentDB = () => JSON.parse(localStorage.getItem('studentDB')) || [];
    const saveStudentDB = (db) => localStorage.setItem('studentDB', JSON.stringify(db));

    const renderStudentList = () => {
        studentList.innerHTML = ''; // Limpiar lista actual
        const db = getStudentDB();
        if (db.length === 0) {
            studentList.innerHTML = '<p>No hay estudiantes registrados.</p>';
            return;
        }

        db.forEach(student => {
            const item = document.createElement('div');
            item.className = 'student-item';
            const gradesHtml = Object.entries(student.grades).map(([key, value]) => `${key}: ${value}`).join(', ');
            item.innerHTML = `
                <div class="info">
                    <strong>${student.name}</strong> (C.I: ${student.id})<br>
                    <span class="grades">Notas: ${gradesHtml}</span>
                </div>
                <button class="delete-btn" data-id="${student.id}">Eliminar</button>
            `;
            studentList.appendChild(item);
        });

        // Añadir event listeners a los botones de eliminar
        studentList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteStudent(btn.dataset.id);
            });
        });
    };

    const addGradeField = () => {
        const gradeField = document.createElement('div');
        gradeField.style.display = 'flex';
        gradeField.style.gap = '10px';
        gradeField.style.marginBottom = '10px';
        gradeField.innerHTML = `
            <input type="text" placeholder="Nombre de la Materia" class="grade-subject" required>
            <input type="number" placeholder="Nota" class="grade-score" required min="0" max="20">
        `;
        gradesContainer.appendChild(gradeField);
    };

    addGradeBtn.addEventListener('click', addGradeField);

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = studentIdInput.value.trim();
        const name = studentNameInput.value.trim();
        const grades = {};
        const gradeFields = gradesContainer.querySelectorAll('div');
        let isValid = true;

        gradeFields.forEach(field => {
            const subject = field.querySelector('.grade-subject').value.trim();
            const score = field.querySelector('.grade-score').value;
            if (subject && score !== '') {
                grades[subject] = parseInt(score, 10);
            } else {
                isValid = false;
            }
        });

        if (!isValid || !id || !name || Object.keys(grades).length === 0) {
            alert('Por favor, rellena todos los campos, incluyendo al menos una materia.');
            return;
        }

        const db = getStudentDB();
        if (db.some(student => student.id === id)) {
            alert('Ya existe un estudiante con esa cédula.');
            return;
        }

        db.push({ id, name, grades });
        saveStudentDB(db);
        renderStudentList();
        
        // Resetear formulario
        studentForm.reset();
        gradesContainer.innerHTML = '';
        addGradeField();
    });

    const deleteStudent = (studentId) => {
        let db = getStudentDB();
        db = db.filter(student => student.id !== studentId);
        saveStudentDB(db);
        renderStudentList();
    };
});
