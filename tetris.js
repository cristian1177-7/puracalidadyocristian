const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const linesElement = document.getElementById("lines");

const startButton = document.getElementById("startButton");
const setSelector = document.getElementById("setSelector");


// =====================================================
// CONFIGURACIÓN
// =====================================================

const FILAS = 20;
const COLUMNAS = 10;
const TAMANO_BLOQUE = 30;

let tablero = [];

let piezaActual = null;

let intervaloCaida = null;

let juegoActivo = false;

let puntuacion = 0;

let lineas = 0;


// =====================================================
// PIEZAS
// =====================================================

const piezas = {

    I: [
        [1, 1, 1, 1]
    ],

    O: [
        [1, 1],
        [1, 1]
    ],

    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],

    L: [
        [1, 0, 0],
        [1, 1, 1]
    ],

    J: [
        [0, 0, 1],
        [1, 1, 1]
    ],

    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],

    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ]
};


// =====================================================
// CREAR TABLERO
// =====================================================

function crearTablero() {

    tablero = [];

    for (let fila = 0; fila < FILAS; fila++) {

        tablero[fila] = [];

        for (let columna = 0; columna < COLUMNAS; columna++) {

            tablero[fila][columna] = 0;
        }
    }
}


// =====================================================
// OBTENER COLOR DESDE CSS
// =====================================================

function obtenerColor(tipo) {

    const estilos = getComputedStyle(document.body);

    const color = estilos
        .getPropertyValue(`--piece-${tipo}`)
        .trim();

    return color || "#ffffff";
}


// =====================================================
// DIBUJAR TABLERO
// =====================================================

function dibujarTablero() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    for (let fila = 0; fila < FILAS; fila++) {

        for (let columna = 0; columna < COLUMNAS; columna++) {

            if (tablero[fila][columna] !== 0) {

                dibujarBloque(
                    columna,
                    fila,
                    tablero[fila][columna]
                );
            }
        }
    }


    dibujarCuadricula();
}


// =====================================================
// DIBUJAR CUADRÍCULA
// =====================================================

function dibujarCuadricula() {

    const estilos = getComputedStyle(document.body);

    const colorCuadricula =
        estilos.getPropertyValue("--grid-color").trim();


    ctx.strokeStyle =
        colorCuadricula || "rgba(255,255,255,0.08)";

    ctx.lineWidth = 1;


    for (let fila = 0; fila <= FILAS; fila++) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            fila * TAMANO_BLOQUE
        );

        ctx.lineTo(
            canvas.width,
            fila * TAMANO_BLOQUE
        );

        ctx.stroke();
    }


    for (let columna = 0; columna <= COLUMNAS; columna++) {

        ctx.beginPath();

        ctx.moveTo(
            columna * TAMANO_BLOQUE,
            0
        );

        ctx.lineTo(
            columna * TAMANO_BLOQUE,
            canvas.height
        );

        ctx.stroke();
    }
}


// =====================================================
// DIBUJAR BLOQUE
// =====================================================

function dibujarBloque(columna, fila, color) {

    ctx.fillStyle = color;

    ctx.fillRect(
        columna * TAMANO_BLOQUE,
        fila * TAMANO_BLOQUE,
        TAMANO_BLOQUE,
        TAMANO_BLOQUE
    );


    ctx.strokeStyle =
        "rgba(0, 0, 0, 0.35)";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        columna * TAMANO_BLOQUE + 1,
        fila * TAMANO_BLOQUE + 1,
        TAMANO_BLOQUE - 2,
        TAMANO_BLOQUE - 2
    );


    // Brillo superior

    ctx.fillStyle =
        "rgba(255,255,255,0.20)";

    ctx.fillRect(
        columna * TAMANO_BLOQUE + 3,
        fila * TAMANO_BLOQUE + 3,
        TAMANO_BLOQUE - 6,
        4
    );
}


// =====================================================
// CREAR PIEZA
// =====================================================

function crearPieza() {

    const tipos = Object.keys(piezas);

    const tipo =
        tipos[
            Math.floor(Math.random() * tipos.length)
        ];


    piezaActual = {

        tipo: tipo,

        forma: piezas[tipo].map(
            fila => [...fila]
        ),

        color: obtenerColor(tipo),

        x: Math.floor(
            (COLUMNAS - piezas[tipo][0].length) / 2
        ),

        y: 0
    };


    // Comprobar Game Over

    if (
        hayColision(
            piezaActual,
            0,
            0
        )
    ) {

        terminarJuego();
    }
}


// =====================================================
// DIBUJAR PIEZA
// =====================================================

function dibujarPieza() {

    if (!piezaActual) {
        return;
    }


    // Actualizar color según el set

    piezaActual.color =
        obtenerColor(piezaActual.tipo);


    for (
        let fila = 0;
        fila < piezaActual.forma.length;
        fila++
    ) {

        for (
            let columna = 0;
            columna <
            piezaActual.forma[fila].length;
            columna++
        ) {

            if (
                piezaActual.forma[fila][columna] === 1
            ) {

                const x =
                    piezaActual.x + columna;

                const y =
                    piezaActual.y + fila;


                if (y >= 0) {

                    dibujarBloque(
                        x,
                        y,
                        piezaActual.color
                    );
                }
            }
        }
    }
}


// =====================================================
// DIBUJAR TODO
// =====================================================

function dibujarTodo() {

    dibujarTablero();

    dibujarPieza();
}


// =====================================================
// COMPROBAR COLISIÓN
// =====================================================

function hayColision(
    pieza,
    movimientoX,
    movimientoY,
    nuevaForma = pieza.forma
) {

    for (
        let fila = 0;
        fila < nuevaForma.length;
        fila++
    ) {

        for (
            let columna = 0;
            columna < nuevaForma[fila].length;
            columna++
        ) {

            if (
                nuevaForma[fila][columna] === 0
            ) {
                continue;
            }


            const nuevaX =
                pieza.x +
                columna +
                movimientoX;


            const nuevaY =
                pieza.y +
                fila +
                movimientoY;


            // Lados

            if (
                nuevaX < 0 ||
                nuevaX >= COLUMNAS
            ) {

                return true;
            }


            // Fondo

            if (nuevaY >= FILAS) {

                return true;
            }


            // Piezas colocadas

            if (
                nuevaY >= 0 &&
                tablero[nuevaY][nuevaX] !== 0
            ) {

                return true;
            }
        }
    }


    return false;
}


// =====================================================
// MOVER PIEZA
// =====================================================

function moverPieza(direccion) {

    if (!juegoActivo || !piezaActual) {
        return;
    }


    if (
        !hayColision(
            piezaActual,
            direccion,
            0
        )
    ) {

        piezaActual.x += direccion;
    }


    dibujarTodo();
}


// =====================================================
// BAJAR PIEZA
// =====================================================

function bajarPieza() {

    if (!juegoActivo || !piezaActual) {
        return;
    }


    if (
        !hayColision(
            piezaActual,
            0,
            1
        )
    ) {

        piezaActual.y++;

    } else {

        fijarPieza();

        eliminarLineas();

        crearPieza();
    }


    dibujarTodo();
}


// =====================================================
// FIJAR PIEZA
// =====================================================

function fijarPieza() {

    for (
        let fila = 0;
        fila < piezaActual.forma.length;
        fila++
    ) {

        for (
            let columna = 0;
            columna <
            piezaActual.forma[fila].length;
            columna++
        ) {

            if (
                piezaActual.forma[fila][columna] === 1
            ) {

                const x =
                    piezaActual.x + columna;

                const y =
                    piezaActual.y + fila;


                if (
                    y >= 0 &&
                    y < FILAS &&
                    x >= 0 &&
                    x < COLUMNAS
                ) {

                    tablero[y][x] =
                        obtenerColor(
                            piezaActual.tipo
                        );
                }
            }
        }
    }
}


// =====================================================
// ROTAR MATRIZ
// =====================================================

function rotarMatriz(matriz) {

    const filas = matriz.length;

    const columnas = matriz[0].length;

    const nuevaMatriz = [];


    for (
        let columna = 0;
        columna < columnas;
        columna++
    ) {

        nuevaMatriz[columna] = [];


        for (
            let fila = filas - 1;
            fila >= 0;
            fila--
        ) {

            nuevaMatriz[columna].push(
                matriz[fila][columna]
            );
        }
    }


    return nuevaMatriz;
}


// =====================================================
// ROTAR PIEZA
// =====================================================

function rotarPieza() {

    if (!juegoActivo || !piezaActual) {
        return;
    }


    const formaAnterior =
        piezaActual.forma;


    const xAnterior =
        piezaActual.x;


    const nuevaForma =
        rotarMatriz(
            piezaActual.forma
        );


    piezaActual.forma =
        nuevaForma;


    // Intentar corregir posición
    // cuando está cerca de un borde

    if (
        hayColision(
            piezaActual,
            0,
            0
        )
    ) {

        if (
            !hayColision(
                piezaActual,
                -1,
                0
            )
        ) {

            piezaActual.x--;

        } else if (
            !hayColision(
                piezaActual,
                1,
                0
            )
        ) {

            piezaActual.x++;

        } else {

            piezaActual.forma =
                formaAnterior;

            piezaActual.x =
                xAnterior;
        }
    }


    dibujarTodo();
}


// =====================================================
// ELIMINAR LÍNEAS
// =====================================================

function eliminarLineas() {

    let lineasEliminadas = 0;


    for (
        let fila = FILAS - 1;
        fila >= 0;
        fila--
    ) {

        const lineaCompleta =
            tablero[fila].every(
                celda => celda !== 0
            );


        if (lineaCompleta) {

            tablero.splice(
                fila,
                1
            );


            tablero.unshift(
                Array(COLUMNAS).fill(0)
            );


            lineasEliminadas++;

            fila++;
        }
    }


    if (lineasEliminadas > 0) {

        actualizarPuntuacion(
            lineasEliminadas
        );
    }
}


// =====================================================
// ACTUALIZAR PUNTUACIÓN
// =====================================================

function actualizarPuntuacion(
    lineasEliminadas
) {

    const puntos = {

        1: 100,

        2: 300,

        3: 500,

        4: 800
    };


    puntuacion +=
        puntos[lineasEliminadas] || 0;


    lineas +=
        lineasEliminadas;


    scoreElement.textContent =
        puntuacion;


    linesElement.textContent =
        lineas;
}


// =====================================================
// GAME OVER
// =====================================================

function terminarJuego() {

    juegoActivo = false;


    if (intervaloCaida) {

        clearInterval(
            intervaloCaida
        );

        intervaloCaida = null;
    }


    dibujarTodo();


    setTimeout(function() {

        alert(
            "GAME OVER\n\n" +
            "Puntuación: " +
            puntuacion +
            "\nLíneas: " +
            lineas
        );

    }, 100);
}


// =====================================================
// CAÍDA AUTOMÁTICA
// =====================================================

function iniciarCaida() {

    if (intervaloCaida) {

        clearInterval(
            intervaloCaida
        );
    }


    intervaloCaida =
        setInterval(function() {

            bajarPieza();

        }, 700);
}


// =====================================================
// INICIAR JUEGO
// =====================================================

function iniciarJuego() {

    if (intervaloCaida) {

        clearInterval(
            intervaloCaida
        );
    }


    crearTablero();


    puntuacion = 0;

    lineas = 0;


    scoreElement.textContent =
        "0";


    linesElement.textContent =
        "0";


    juegoActivo = true;


    crearPieza();


    dibujarTodo();


    iniciarCaida();


    startButton.textContent =
        "Reiniciar Juego";
}


// =====================================================
// CAMBIAR SET
// =====================================================

function cambiarSet() {

    const setSeleccionado =
        setSelector.value;


    document.body.className =
        `set-${setSeleccionado}`;


    if (piezaActual) {

        piezaActual.color =
            obtenerColor(
                piezaActual.tipo
            );
    }


    dibujarTodo();
}


// =====================================================
// CONTROLES DEL TECLADO
// =====================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (!juegoActivo) {
            return;
        }


        switch (event.key) {

            case "ArrowLeft":

                event.preventDefault();

                moverPieza(-1);

                break;


            case "ArrowRight":

                event.preventDefault();

                moverPieza(1);

                break;


            case "ArrowDown":

                event.preventDefault();

                bajarPieza();

                break;


            case "ArrowUp":

                event.preventDefault();

                rotarPieza();

                break;
        }
    }
);


// =====================================================
// EVENTOS
// =====================================================

startButton.addEventListener(
    "click",
    iniciarJuego
);


setSelector.addEventListener(
    "change",
    cambiarSet
);


// =====================================================
// INICIALIZACIÓN
// =====================================================

crearTablero();

document.body.className =
    "set-clasico";

dibujarTablero();