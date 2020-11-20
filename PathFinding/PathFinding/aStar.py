class Vector2:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "X: " + str(self.x) + " Y: " + str(self.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y


class Node:
    def __init__(self, pos: Vector2):
        self.g = 0
        self.h = 0
        self.f = 0
        self.pos = pos
        self.parent = None

    def __init__(self, x, y):
        self.g = 0
        self.h = 0
        self.f = 0
        self.pos = Vector2(x, y)
        self.parent = None

    def __str__(self):
        return "G: " + str(self.g) + " H: " + str(self.h) + " F: " + str(self.f) + " " + self.pos.__str__()

    def calculateHCost(self, targetX, targetY):
        self.h = abs(targetX - self.pos.x) + abs(targetY - self.pos.y)

    def calculateFCost(self):
        self.f = self.g + self.h


def findNodeWithName(map, name: str):
    for x in range(len(map)):
        for y in range(len(map[x])):
            if map[x][y] == name:
                return Node(x, y)

    return None


def getWalkableNode(x, y, map):
    proposedNodes = []

    if y - 1 >= 0:
        proposedNodes.append(Node(x, y - 1))
    if y + 1 < len(map[0]):
        proposedNodes.append(Node(x, y + 1))
    if x - 1 >= 0:
        proposedNodes.append(Node(x - 1, y))
    if x + 1 < len(map):
        proposedNodes.append(Node(x + 1, y))

    return list(filter(
        lambda current: map[current.pos.x][current.pos.y] == "empty" or map[current.pos.x][current.pos.y] == "end",
        proposedNodes))


def calculateRoute(map, start, target):
    current = None
    openList = []
    closedList = []
    g = 0
    openList.append(start)

    while len(openList) > 0:
        # Get the Node with the lowest F score
        lowest = min(val.f for val in openList)
        current = next(val for val in openList if val.f == lowest)

        # add the current Node to the closed list and remove it from the current
        closedList.append(current)

        openList.remove(current)

        # if the target added to the closed list then we found the target
        if next((val for val in closedList if val.pos == target.pos), None) is not None:
            break

        walkableNodes = getWalkableNode(current.pos.x, current.pos.y, map);
        ++g

        for walkable in walkableNodes:
            # if this walkable square is already in the closed list, ignore it
            if next((val for val in closedList if val.pos == walkable.pos), None) is not None:
                continue

            # if it's not in the open list...
            if next((val for val in openList if val.pos == walkable.pos), None) is None:
                # compute its score, set the parent, add to the open list
                walkable.g = g
                walkable.calculateHCost(target.pos.x, target.pos.y)
                walkable.calculateFCost()
                walkable.parent = current

                openList.insert(0, walkable)

            # test if using the current G score makes the adjacent square's F score lower, if yes update the parent because it means it's a better path
            elif g + walkable.h < walkable.f:
                walkable.g = g
                walkable.calculateFCost()
                walkable.parent = current

    return current


def mapRouteToList(map):
    start = findNodeWithName(map, 'start')
    target = findNodeWithName(map, 'end')

    if start is None:
        raise ValueError("Start not found")

    if target is None:
        raise ValueError("End not found")

    current = calculateRoute(map, start, target)
    if current is None:
        return "Something went wrong! :("

    if current.pos != target.pos:
        return "No path found to the target!"

    route = []
    while current is not None:
        route.append(current)
        current = current.parent

    route.reverse()

    return route
