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
    std::vector<Building> buildings;                      // index -> Building
    std::unordered_map<std::string, int> nameToId;        // building name -> id
    std::vector<std::vector<std::pair<int,int>>> adj;     // (neighborId, weight)

public:
    Graph();

    int addBuilding(const std::string& name);
    void addPath(const std::string& from, const std::string& to, int distance);
    void listBuildings() const;
    int getId(const std::string& name) const;

    void bfs(const std::string& startName) const;         // uses queue
    void dfs(const std::string& startName) const;         // uses stack
    void shortestPath(const std::string& from,
                      const std::string& to) const;       // Dijkstra + stack
};

#endif // GRAPH_H
