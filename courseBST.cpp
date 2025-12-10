#include "CourseBST.h"
#include <iostream>

CourseBST::CourseBST() : root(nullptr) {}

CourseBST::~CourseBST() {
    freeRec(root);
}

CourseNode* CourseBST::insertRec(CourseNode* node, const Course& c) {
    if (!node) return new CourseNode(c);
    if (c.code < node->data.code) {
        node->left = insertRec(node->left, c);
    }
    else if (c.code > node->data.code){
        node->right = insertRec(node->right, c);
    }
    return node;
}

CourseNode* CourseBST::searchRec(CourseNode* node, const std::string& code) const {
    if (!node || node->data.code == code) {
        return node;
    }
    if (code < node->data.code){
        return searchRec(node->left, code);
    }
    return searchRec(node->right, code);
}

void CourseBST::inorderRec(CourseNode* node) const {
    if (!node) {
        return;
    }
    inorderRec(node->left);
    std::cout << node->data.code << " - " << node->data.name
              << " (" << node->data.day << " " << node->data.time << ")\n";
    inorderRec(node->right);
}

void CourseBST::freeRec(CourseNode* node) {
    if (!node) {
        return;
    }
    freeRec(node->left);
    freeRec(node->right);
    delete node;
}

void CourseBST::insert(const Course& c) {
    root = insertRec(root, c);
}

CourseNode* CourseBST::search(const std::string& code) const {
    return searchRec(root, code);
}

void CourseBST::printInOrder() const {
    inorderRec(root);
}
