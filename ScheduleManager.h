#ifndef SCHEDULEMANAGER_H
#define SCHEDULEMANAGER_H

#include <unordered_map>
#include <list>
#include <string>
#include "Course.h"

class ScheduleManager {
private:
    // day -> list of courses (linked list)
    std::unordered_map<std::string, std::list<Course>> scheduleByDay;

public:
    void addCourse(const Course& c);
    void showDay(const std::string& day) const;
};

#endif // SCHEDULEMANAGER_H
