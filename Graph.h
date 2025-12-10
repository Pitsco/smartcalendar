#ifndef GRAPH_H
#define GRAPH_H

#include <string>
#include <vector>
#include <unordered_map>

struct Building {
    int id;
    std::string name;
};

class Graph {
private:
    std::vector<Building> buildings;
    std::unordered_map<std::string, int> nameToId;
    std::vector<std::vector<std::pair<int,int>>> adj;

public:
    Graph();

    int addBuilding(const std::string& name);
    void addPath(const std::string& from, const std::string& to, int distance);
    void removePath(const std::string& from, const std::string& to);
    void listBuildings() const;
    void listPaths() const;
    int getId(const std::string& name) const;

    void bfs(const std::string& startName) const;
    void dfs(const std::string& startName) const;
    void shortestPath(const std::string& from,
                      const std::string& to) const;
};

#endif
