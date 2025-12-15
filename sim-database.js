// Base de Datos Simulada Persistente usando localStorage

// 1. Definimos los datos iniciales, por si la base de datos no existe.
const initialData = [
    {
        id: "28123456",
        name: "Ana Rincón",
        grades: {
            "cálculo 1": 18,
            "física 1": 16,
            "introducción a la programación": 19,
        }
    },
    {
        id: "30987654",
        name: "Luis Bohorquez",
        grades: {
            "historia de venezuela": 15,
            "geografía económica": 17,
            "inglés 2": 20,
        }
    },
    {
        id: "27555111",
        name: "Carla Fuenmayor",
        grades: {
            "química orgánica": 12,
            "laboratorio de química": 14,
            "biología celular": 18,
        }
    }
];

// 2. Función de inicialización
const initializeDB = () => {
    // Verificamos si ya existe una base de datos en el localStorage del navegador.
    if (localStorage.getItem('studentDB') === null) {
        console.log("Creando la base de datos inicial en localStorage...");
        // Si no existe, convertimos nuestros datos iniciales a un string JSON y los guardamos.
        localStorage.setItem('studentDB', JSON.stringify(initialData));
    } else {
        console.log("La base de datos ya existe en localStorage. No se hace nada.");
    }
};

// 3. Ejecutamos la inicialización tan pronto como el script se carga.
initializeDB();
