#include "ScheduleManager.h"
#include <iostream>

void ScheduleManager::addCourse(const Course& c) {
    scheduleByDay[c.day].push_back(c);
}

void ScheduleManager::showDay(const std::string& day) const {
    auto it = scheduleByDay.find(day);
    if (it == scheduleByDay.end() || it->second.empty()) {
        std::cout << "No courses scheduled for " << day << "\n";
        return;
    }
    std::cout << "Schedule for " << day << ":\n";
    for (const auto& c : it->second) {
        std::cout << "  " << c.time << " - " << c.code << " : " << c.name << "\n";
    }
}
