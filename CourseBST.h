#ifndef COURSEBST_H
#define COURSEBST_H

#include "Course.h"

struct CourseNode {
    Course data;
    CourseNode* left;
    CourseNode* right;

    CourseNode(const Course& c) : data(c), left(nullptr), right(nullptr) {}
};

class CourseBST {
private:
    CourseNode* root;

    CourseNode* insertRec(CourseNode* node, const Course& c);
    CourseNode* searchRec(CourseNode* node, const std::string& code) const;
    void inorderRec(CourseNode* node) const;
    void freeRec(CourseNode* node);

public:
    CourseBST();
    ~CourseBST();

    void insert(const Course& c);
    CourseNode* search(const std::string& code) const;
    void printInOrder() const;
};

#endif // COURSEBST_H
