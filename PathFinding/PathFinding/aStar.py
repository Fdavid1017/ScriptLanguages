from PathFinding.Node import Node


def findNodeWithName(map, name: str):
    for x in range(len(map)):
        for y in range(len(map[x])):
            if map[x][y] == name:
                return Node(x, y)

    return None


def getWalkableNode(x, y, map, allowDiagonal):
    proposedNodes = []

    if y - 1 >= 0:
        proposedNodes.append(Node(x, y - 1))
    if y + 1 < len(map[0]):
        proposedNodes.append(Node(x, y + 1))
    if x - 1 >= 0:
        proposedNodes.append(Node(x - 1, y))
    if x + 1 < len(map):
        proposedNodes.append(Node(x + 1, y))

    if allowDiagonal == "true":
        if y - 1 >= 0 and x - 1 >= 0:
            proposedNodes.append(Node(x - 1, y - 1))
        if y + 1 < len(map[0]) and x + 1 < len(map):
            proposedNodes.append(Node(x + 1, y + 1))
        if x - 1 >= 0 and y + 1 < len(map[0]):
            proposedNodes.append(Node(x - 1, y + 1))
        if x + 1 < len(map) and y - 1 >= 0:
            proposedNodes.append(Node(x + 1, y - 1))

    return list(filter(
        lambda current: map[current.x][current.y] == "empty" or map[current.x][current.y] == "end",
        proposedNodes))


def calculateRoute(map, start, target, allowDiagonal):
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
        # current.g = g
        closedList.append(current)

        openList.remove(current)

        # if the target added to the closed list then we found the target
        if next((val for val in closedList if val.x == target.x and val.y == target.y), None) is not None:
            break

        walkableNodes = getWalkableNode(current.x, current.y, map, allowDiagonal);
        g = g + 1

        for walkable in walkableNodes:
            # if this walkable square is already in the closed list, ignore it
            if next((val for val in closedList if val.x == walkable.x and val.y == walkable.y), None) is not None:
                continue

            # if it's not in the open list...
            if next((val for val in openList if val.x == walkable.x and val.y == walkable.y), None) is None:
                # compute its score, set the parent, add to the open list
                walkable.g = g
                walkable.calculateHCost(target.x, target.y)
                walkable.calculateFCost()
                walkable.parent = current

                openList.insert(0, walkable)

            # test if using the current G score makes the adjacent square's F score lower, if yes update the parent because it means it's a better path
            elif g + walkable.h < walkable.f:
                walkable.g = g
                walkable.calculateFCost()
                walkable.parent = current

    return current, closedList


def mapRouteToList(map, allowDiagonal):
    start = findNodeWithName(map, 'start')
    target = findNodeWithName(map, 'end')

    if start is None:
        raise ValueError("Start not found")

    if target is None:
        raise ValueError("End not found")

    result = calculateRoute(map, start, target, allowDiagonal)
    current = result[0]
    if current is None:
        raise RuntimeError("Something went wrong, no value returned")

    if not (current.x == target.x and current.y == target.y):
        # No route found to the destination
        return None, result[1]

    route = []
    while current is not None:
        route.append(current)
        current = current.parent

    for c in route:
        c.parent = None

    route.reverse()

    return route, result[1]
