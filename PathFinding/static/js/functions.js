const colorModes = ["start", "end", "wall", "empty", "path", "checked"];
const startSize = 5;

var mouseButtonPos = 0;
var currentColorMode = "start";
var map = [];
var startLocation = [undefined, undefined];
var endLocation = [undefined, undefined];
var csrftoken = getCookie('csrftoken');
var previousMapSize = [startSize, startSize];
var closedList = [];


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

    element.childNodes.forEach(c => {
        if (c.classList.contains("pathDirectionArrow")) {
            c.remove();
        }
    })

    addClass(element, currentColorMode);

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

            if (endLocation[0] == x && endLocation[1] == y) {
                endLocation[0] = undefined;
                endLocation[1] = undefined
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

            if (startLocation[0] == x && startLocation[1] == y) {
                startLocation[0] = undefined;
                startLocation[1] = undefined
            }

            endLocation[0] = x;
            endLocation[1] = y;
            map[endLocation[0]][endLocation[1]] = currentColorMode;
            break;

        case "empty":
            if (startLocation[0] == x && startLocation[1] == y) {
                startLocation[0] = undefined;
                startLocation[1] = undefined;
            } else if (endLocation[0] == x && endLocation[1] == y) {
                endLocation[0] = undefined;
                endLocation[1] = undefined;
            }
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

            // TODO: set them to the same square size

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
    map = GenerateMap(rows, columns);
    startLocation = [undefined, undefined];
    endLocation = [undefined, undefined];
    document.getElementById("executeTimeDisplay").innerHTML = "";
    previousMapSize[0] = rows;
    previousMapSize[1] = columns;

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

function setColorMode(mode, target) {
    var prev = document.getElementById("selectedColorModeHighlite");
    if (prev) {
        prev.id = "";
        addClass(prev, "basicTile")
    }

    currentColorMode = mode;
    target.id = "selectedColorModeHighlite";
    removeClass(target, "basicTile")
}

function sendMap() {
    var postdata = {
        'map': map,
        'csrfmiddlewaretoken': csrftoken
    };

    if (!startLocation[0] && !startLocation[1]) {
        showModal("Start tile not found!\nPlace a start tile before trying to get the route!");
        return;
    }

    if (!endLocation[0] && !endLocation[1]) {
        showModal("Finish tile not found!\nPlace a finish tile before trying to get the route!");
        return;
    }

    // Cleaning up previous path display
    $('.pathDirectionArrow').remove();
    var table = document.getElementById("gridTable");
    for (var x = 0; x < map.length; x++) {
        for (var y = 0; y < map[x].length; y++) {
            removeClass(table.rows[x].cells[y], "path");
            removeClass(table.rows[x].cells[y], "checked");
        }
    }
    closedList = []

    $.ajax({
        type: 'POST',
        url: "",
        dataType: "json",
        data: postdata,
        success: function (response) {
            document.getElementById("executeTimeDisplay").innerHTML = (response.data.executeTime.toFixed(7) + " sec");

            var closedData = [];
            response.data.closedList.forEach(
                element => {
                    var obj = JSON.parse(element);
                    closedData.push(obj);
                }
            );
            closedList = closedData;
            if (document.getElementById("showExploredTilesSwitch").checked) {
                console.log("check")
                RevealCheckedCells(table)
            }

            if (response.data.error) {
                showModal(response.data.error)
                return;
            }

            var data = [];
            response.data.route.forEach(
                element => {
                    var obj = JSON.parse(element);
                    data.push(obj);
                }
            );

            processResponse(data);
        }
    });
}

function showModal(text) {
    $('#messageModal').modal('show')
    $('#messageModal').find('.modal-body').text(text);
    $('#messageModal').find('.modal-body').html($('#messageModal').find('.modal-body').html().replace(/\n/g, '<br/>'));
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

    var previousRotation = 0;

    for (var i = 0; i < responsePath.length; i++) {
        var cell = table.rows[responsePath[i].x].cells[responsePath[i].y];

        // show arrows pointing to the next tile
        if (i == 0) {
            previousRotation = getRotationToNextCell(responsePath[i].x, responsePath[i].y, responsePath[i + 1].x, responsePath[i + 1].y);
        }

        if (i < responsePath.length - 1 && i > 0) {
            var img = document.createElement("IMG");
            img.setAttribute("width", cell.getAttribute("width"))
            img.setAttribute("height", cell.getAttribute("height"))
            addClass(img, "pathDirectionArrow")

            var rotation = getRotationToNextCell(responsePath[i].x, responsePath[i].y, responsePath[i + 1].x, responsePath[i + 1].y)
            var iconName = "arrow-up.svg"
            if (previousRotation != rotation) {
                switch (previousRotation) {
                    case 0:
                        if (rotation == 90) iconName = "arrow-90deg-right.svg";
                        else iconName = "arrow-90deg-left.svg";
                        break;
                    case 90:
                        if (rotation == 0) iconName = "arrow-90deg-up.svg";
                        else iconName = "arrow-90deg-down.svg";
                        addClass(img, "horizontalMirror")
                        break;
                    case 180:
                        if (rotation == 90) iconName = "arrow-90deg-right.svg";
                        else iconName = "arrow-90deg-left.svg";
                        addClass(img, "verticalMirror")
                        break;
                    case 270:
                        if (rotation == 0) iconName = "arrow-90deg-up.svg";
                        else iconName = "arrow-90deg-down.svg";
                        break;
                }
                previousRotation = rotation;
                rotation = 0;
            } else {
                previousRotation = rotation;
            }

            img.setAttribute("src", ICONS_URL + iconName)

            if (rotation != 0) addClass(img, "rotate" + rotation)

            cell.appendChild(img);
        }

        if (!(responsePath[i].x == startLocation[0] && responsePath[i].y == startLocation[1]) &&
            !(responsePath[i].x == endLocation[0] && responsePath[i].y == endLocation[1])) {
            addClass(cell, "path");
            await sleep(getSpeedRange())
        }
    }
}

function getRotationToNextCell(currentX, currentY, nextX, nextY) {
    if (currentX > nextX) return 0;
    if (currentX < nextX) return 180;
    if (currentY > nextY) return 270;
    if (currentY < nextY) return 90;

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearMap() {
    createTable(previousMapSize[0], previousMapSize[1]);
}

function getSpeedRange() {
    return Math.abs(document.getElementById("speedRange").value);
}

function showExploredTilesSwitchClicked(cb) {
    var table = document.getElementById("gridTable");
    if (cb.checked) {
        RevealCheckedCells(table)
    } else {
        var checkedList = document.querySelectorAll(".checked");
        checkedList.forEach(cell => {
            //var cell = table.rows[node.x].cells[node.y];
            removeClass(cell, "checked");
        });
    }
}

async function RevealCheckedCells(table) {
    for (const node of closedList) {
        var cell = table.rows[node.x].cells[node.y];
        if (
            //"start", "end", "wall", "empty", "path", "checked"
            cell.classList.contains("start") ||
            cell.classList.contains("end") ||
            cell.classList.contains("wall") ||
            cell.classList.contains("path") ||
            cell.classList.contains("checked")
        ) {
            continue;
        }
        addClass(cell, "checked");
        await sleep(getSpeedRange())
    }
}