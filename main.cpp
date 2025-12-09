#include <iostream>
#include <vector>
#include <limits>

#include "Graph.h"
#include "ScheduleManager.h"
#include "CourseBST.h"
#include "Course.h"

void printMenu() {
    std::cout << "\n==== Campus Pathfinder & Planner ====\n";
    std::cout << "1. Add building\n";
    std::cout << "2. Add path between buildings\n";
    std::cout << "3. List buildings\n";
    std::cout << "4. Run BFS from building\n";
    std::cout << "5. Run DFS from building\n";
    std::cout << "6. Find shortest path between buildings\n";
    std::cout << "7. Add course to schedule\n";
    std::cout << "8. Show schedule for a day\n";
    std::cout << "9. List all courses (BST in-order)\n";
    std::cout << "10. List all courses sorted by code (merge sort + binary search demo)\n";
    std::cout << "0. Exit\n";
    std::cout << "Select option: ";
}

int main() {
    Graph graph;
    ScheduleManager schedule;
    CourseBST bst;
    std::vector<Course> allCourses; // for sorting + binary search

    // Optional: preload some sample data
    graph.addPath("Library", "Cafeteria", 5);
    graph.addPath("Library", "Gym", 7);
    graph.addPath("Gym", "Dorm", 3);

    int choice;
    while (true) {
        printMenu();
        if (!(std::cin >> choice)) break;
        if (choice == 0) break;

        if (choice == 1) {
            std::string name;
            std::cout << "Enter building name: ";
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::getline(std::cin, name);
            graph.addBuilding(name);
            std::cout << "Building added.\n";
        }
        else if (choice == 2) {
            std::string a, b;
            int dist;
            std::cout << "From building: ";
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::getline(std::cin, a);
            std::cout << "To building: ";
            std::getline(std::cin, b);
            std::cout << "Distance (integer): ";
            std::cin >> dist;
            graph.addPath(a, b, dist);
            std::cout << "Path added.\n";
        }
        else if (choice == 3) {
            graph.listBuildings();
        }
        else if (choice == 4) {
            std::string start;
            std::cout << "Start building name: ";
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::getline(std::cin, start);
            graph.bfs(start);
        }
        else if (choice == 5) {
            std::string start;
            std::cout << "Start building name: ";
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::getline(std::cin, start);
            graph.dfs(start);
        }
        else if (choice == 6) {
            std::string from, to;
            std::cout << "From building: ";
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::getline(std::cin, from);
            std::cout << "To building: ";
            std::getline(std::cin, to);
            graph.shortestPath(from, to);
        }
        else if (choice == 7) {
            Course c;
            std::cout << "Course code: ";
            std::cin >> c.code;

            std::cout << "Course name (one line): ";
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::getline(std::cin, c.name);

            std::cout << "Day (e.g., Mon, Tue): ";
            std::cin >> c.day;

            std::cout << "Time (e.g., 10:00): ";
            std::cin >> c.time;

            schedule.addCourse(c);
            bst.insert(c);
            allCourses.push_back(c);
            std::cout << "Course added.\n";
        }
        else if (choice == 8) {
            std::string day;
            std::cout << "Enter day (e.g., Mon): ";
            std::cin >> day;
            schedule.showDay(day);
        }
        else if (choice == 9) {
            std::cout << "Courses (BST in-order by code):\n";
            bst.printInOrder();
        }
        else if (choice == 10) {
            if (allCourses.empty()) {
                std::cout << "No courses available.\n";
                continue;
            }
            mergeSort(allCourses, 0, static_cast<int>(allCourses.size()) - 1);

            std::cout << "Courses sorted by code (merge sort):\n";
            for (const auto& c : allCourses) {
                std::cout << c.code << " - " << c.name
                          << " (" << c.day << " " << c.time << ")\n";
            }

            std::string target;
            std::cout << "Enter course code to search (binary search): ";
            std::cin >> target;
            int idx = binarySearchCourse(allCourses, target);
            if (idx == -1) {
                std::cout << "Course not found.\n";
            } else {
                const auto& c = allCourses[idx];
                std::cout << "Found: " << c.code << " - " << c.name
                          << " (" << c.day << " " << c.time << ")\n";
            }
        }
        else {
            std::cout << "Invalid option.\n";
        }
    }

    std::cout << "Exiting program.\n";
    return 0;
}
