#include "graph.h"
#include <iostream>
#include <queue>
#include <stack>
#include <limits>
#include <functional>
#include <algorithm>

Graph::Graph() {}

int Graph::addBuilding(const std::string& name) {
    auto it = nameToId.find(name);
    if (it != nameToId.end()) {
        return it->second;
    }
    int id = static_cast<int>(buildings.size());
    buildings.push_back({id, name});
    nameToId[name] = id;
    adj.push_back({});
    return id;
}

void Graph::addPath(const std::string& from, const std::string& to, int distance) {
    int u = addBuilding(from);
    int v = addBuilding(to);
    adj[u].push_back({v, distance});
    adj[v].push_back({u, distance});
}

void Graph::removePath(const std::string& from, const std::string& to) {
    int u = getId(from);
    int v = getId(to);
    if (u == -1 || v == -1) {
        std::cout << "Unknown building name(s).\n";
        return;
    }

    auto removeEdge = [&](int a, int b) {
        auto &vec = adj[a];
        vec.erase(
            std::remove_if(vec.begin(), vec.end(),
                           [b](const std::pair<int,int>& e) { return e.first == b; }),
            vec.end()
        );
    };

    std::size_t beforeU = adj[u].size();
    std::size_t beforeV = adj[v].size();

    removeEdge(u, v);
    removeEdge(v, u);

    if (adj[u].size() == beforeU && adj[v].size() == beforeV) {
        std::cout << "No path existed between " << from
                  << " and " << to << ".\n";
    } else {
        std::cout << "Path removed between " << from
                  << " and " << to << ".\n";
    }
}

void Graph::listBuildings() const {
    std::cout << "Buildings in campus map:\n";
    for (const auto& b : buildings) {
        std::cout << "  [" << b.id << "] " << b.name << "\n";
    }
}

void Graph::listPaths() const {
    std::cout << "Paths in campus map:\n";
    bool any = false;
    for (std::size_t u = 0; u < adj.size(); ++u) {
        for (auto [v, w] : adj[u]) {
            if (u < static_cast<std::size_t>(v)) {
                any = true;
                std::cout << "  " << buildings[u].name << " <-> "
                          << buildings[v].name << " (distance " << w << ")\n";
            }
        }
    }
    if (!any) {
        std::cout << "  (no paths yet)\n";
    }
}

int Graph::getId(const std::string& name) const {
    auto it = nameToId.find(name);
    if (it == nameToId.end()) {
        return -1;
    }
    return it->second;
}

void Graph::bfs(const std::string& startName) const {
    int start = getId(startName);
    if (start == -1) {
        std::cout << "Unknown building: " << startName << "\n";
        return;
    }
    std::vector<bool> visited(buildings.size(), false);
    std::queue<int> q;
    q.push(start);
    visited[start] = true;

    std::cout << "BFS from " << startName << ": ";
    while (!q.empty()) {
        int u = q.front(); q.pop();
        std::cout << buildings[u].name << " ";
        for (auto [v, w] : adj[u]) {
            (void)w;
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    std::cout << "\n";
}

void Graph::dfs(const std::string& startName) const {
    int start = getId(startName);
    if (start == -1) {
        std::cout << "Unknown building: " << startName << "\n";
        return;
    }
    std::vector<bool> visited(buildings.size(), false);
    std::stack<int> st;
    st.push(start);

    std::cout << "DFS from " << startName << ": ";
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (visited[u]) {
            continue;
        }
        visited[u] = true;
        std::cout << buildings[u].name << " ";
        for (auto [v, w] : adj[u]) {
            (void)w;
            if (!visited[v]) {
                st.push(v);
            }
        }
    }
    std::cout << "\n";
}

void Graph::shortestPath(const std::string& from, const std::string& to) const {
    int src = getId(from);
    int dst = getId(to);
    if (src == -1 || dst == -1) {
        std::cout << "Unknown building name(s).\n";
        return;
    }
    int n = static_cast<int>(buildings.size());
    const int INF = std::numeric_limits<int>::max();
    std::vector<int> dist(n, INF);
    std::vector<int> parent(n, -1);
    dist[src] = 0;

    using P = std::pair<int,int>;
    std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d != dist[u]) {
            continue;
        }
        if (u == dst) {
            break;
        }
        for (auto [v, w] : adj[u]) {
            if (dist[u] != INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    if (dist[dst] == INF) {
        std::cout << "No path between those buildings.\n";
        return;
    }

    std::stack<int> path;
    for (int v = dst; v != -1; v = parent[v]) {
        path.push(v);
    }

    std::cout << "Shortest path from " << from << " to " << to
              << " (distance " << dist[dst] << "):\n";
    while (!path.empty()) {
        int v = path.top(); path.pop();
        std::cout << "  -> " << buildings[v].name << "\n";
    }
}
