#ifndef COURSE_H
#define COURSE_H

#include <string>
#include <vector>

struct Course {
    std::string code;
    std::string name;
    std::string day; 
    std::string time; 
};

void mergeSort(std::vector<Course>& arr, int l, int r);
int binarySearchCourse(const std::vector<Course>& arr, const std::string& code);

#endif
