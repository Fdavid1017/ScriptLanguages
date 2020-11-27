from json import JSONEncoder


class Node:
    def __init__(self, x, y):
        # Distance from start
        self.g = 0
        # Distance from end
        self.h = 0
        # G+H
        self.f = 0
        self.x = x
        self.y = y
        self.parent = None

    def __str__(self):
        return "G: " + str(self.g) + " H: " + str(self.h) + " F: " + str(self.f) + " X: " + str(self.x) + " Y: " + str(
            self.y)

    def calculateHCost(self, targetX, targetY):
        self.h = abs(targetX - self.x) + abs(targetY - self.y)

    def calculateFCost(self):
        self.f = self.g + self.h


class NodeEncoder(JSONEncoder):
    def default(self, object):
        if isinstance(object, Node):
            return object.__dict__
        else:
            return JSONEncoder.default(self, object)
