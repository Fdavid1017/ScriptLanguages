const colorModes = ["start", "end", "wall", "empty", "path"];
const startSize = 5;

var mouseButtonPos = 0;
var currentColorMode = "start";
var map = GenerateMap(startSize, startSize);
var startLocation = [undefined, undefined];
var endLocation = [undefined, undefined];
var csrftoken = getCookie('csrftoken');


//Start up
function startUp() {
    createTable(startSize, startSize);
    document.getElementById("tableColumnsSize").value = startSize;
    document.getElementById("tableRowsSize").value = startSize;
}

function isMouseDown() {
    return mouseButtonPos == 1;
}

function mouseDown() {
    ++mouseButtonPos;
}

function mouseUp() {
    --mouseButtonPos;
}

function addClass(element, className) {
    element.classList.add(className);
}

function removeClass(element, className) {
    element.classList.remove(className);
}

function GenerateMap(rows, columns) {
    var matrix = [];
    for (var i = 0; i < rows; i++) {
        matrix[i] = [];
        for (var j = 0; j < columns; j++) {
            matrix[i][j] = "empty";
        }
    }
    return matrix;
}

function removeAnyColorMode(element) {
    colorModes.forEach((current) => {
        if (element.classList.contains(current)) {
            removeClass(element, current);
            addClass(element, "empty")
        }
    });
}

function select(element, x, y) {
    colorModes.forEach((current) => {
        if (element.classList.contains(current)) {
            removeClass(element, current);
        }
    });

    if (currentColorMode != "empty") addClass(element, currentColorMode);

    map[x][y] = currentColorMode;

    switch (currentColorMode) {
        case "start":
            if (startLocation[0] != undefined && startLocation[1] != undefined) {
                map[startLocation[0]][startLocation[1]] = "empty";
                removeAnyColorMode(
                    document.getElementById("gridTable").rows[startLocation[0]].cells[
                        startLocation[1]
                        ]
                );
            }

            startLocation[0] = x;
            startLocation[1] = y;
            map[startLocation[0]][startLocation[1]] = currentColorMode;
            break;

        case "end":
            if (endLocation[0] != undefined && endLocation[1] != undefined) {
                map[endLocation[0]][endLocation[1]] = "empty";
                removeAnyColorMode(
                    document.getElementById("gridTable").rows[endLocation[0]].cells[
                        endLocation[1]
                        ]
                );
            }

            endLocation[0] = x;
            endLocation[1] = y;
            map[endLocation[0]][endLocation[1]] = currentColorMode;
            break;
    }
}

function createTable(rows, columns) {
    var old = document.getElementById("gridTable");
    if (old) {
        old.remove();
    }

    var table = document.createElement("table");
    table.id = "gridTable";
    addClass(table, "spacedTable-10");

    for (let row = 0; row < rows; row++) {
        var tr = document.createElement("tr");

        for (let col = 0; col < columns; col++) {
            var td = document.createElement("td");
            addClass(td, "min50");
            addClass(td, "empty");

            td.addEventListener("mouseenter", function (event) {
                addClass(event.target, "highlight");
                CellDraw(event.target, row, col);
            });
            td.addEventListener("mouseout", function (event) {
                removeClass(event.target, "highlight");
            });
            td.addEventListener("click", function (event) {
                select(event.target, row, col);
            });

            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    GenerateMap(rows, columns)
    document.getElementById("generatedTablePlace").appendChild(table);
}

function CellDraw(target, x, y) {
    if (
        !isMouseDown() ||
        currentColorMode == "start" ||
        currentColorMode == "end"
    )
        return;

    select(target, x, y);
}

function setSolorMode(mode, target) {
    var prev = document.getElementById("selectedColorModeHighlite");
    if (prev) prev.id = "";

    currentColorMode = mode;
    target.id = "selectedColorModeHighlite";
}

function sendMap() {
    var postdata = {
        'map': map,
        'csrfmiddlewaretoken': csrftoken
    };

    // $.post('', postdata, function (response) {
    //     console.log(response.value);
    // });

    $.ajax({
        type: 'POST',
        url: "",
        dataType: "json",
        data: postdata,
        success: function (response) {
            var data = []
            response.data.route.forEach(
                element => {
                    var obj = JSON.parse(element);
                    data.push(obj);
                }
            );
            console.log(response.data.executeTime);
            document.getElementById("executeTimeDisplay").innerHTML = (response.data.executeTime.toFixed(7) + " sec");
            processResponse(data);
        }
    });

    //console.log(map)
    console.log("map sent");
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function processResponse(responsePath) {
    var table = document.getElementById("gridTable")
    if (!table) return;

    for (var i = 0; i < responsePath.length; i++) {
        if (!(responsePath[i].x == startLocation[0] && responsePath[i].y == startLocation[1]) &&
            !(responsePath[i].x == endLocation[0] && responsePath[i].y == endLocation[1])) {
            addClass(table.rows[responsePath[i].x].cells[responsePath[i].y], "path");
            await sleep(250)
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}