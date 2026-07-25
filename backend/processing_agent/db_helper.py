"""
DBHelper is the single point of contact with MongoDB.

Every domain module (processing_agent/nksuits/*, processing_agent/suitstyle/*)
creates its own DBHelper instance, selects one collection, and calls these
generic methods. Domain-specific behavior (validation, counters, sorting)
lives in the domain modules, not here.
"""

from pymongo import MongoClient
from pymongo.server_api import ServerApi
from config import MONGODB_URI


class DBHelper:

    def __init__(self, db_name="boutique_app"):
        self.client = MongoClient(MONGODB_URI, server_api=ServerApi("1"))
        self.db = self.client[db_name]
        print("[DBHelper] Connection Created")

    def select_collection(self, collection_name):
        self.collection = self.db[collection_name]
        print("[DBHelper] Collection Selected:", collection_name)

    def save_document(self, document):
        result = self.collection.insert_one(document)
        print("[DBHelper] Document Saved. Id is:", result.inserted_id)
        return result.inserted_id

    def save_many_documents(self, documents):
        result = self.collection.insert_many(documents)
        print("[DBHelper] Documents Saved")
        return result.inserted_ids

    def retrieve_documents(self, condition=None, sort_by=None):
        if condition is None:
            condition = {}
        if sort_by is not None:
            result = self.collection.find(condition).sort(sort_by)
        else:
            result = self.collection.find(condition)
        print("[DBHelper] Documents Retrieved")
        return result

    def retrieve_one_document(self, condition):
        result = self.collection.find_one(condition)
        print("[DBHelper] Document Retrieved:", result)
        return result

    def count_documents(self, condition=None):
        if condition is None:
            condition = {}
        count = self.collection.count_documents(condition)
        print("[DBHelper] Document Count:", count)
        return count

    def update_document(self, condition, document_to_update):
        result = self.collection.update_one(condition, {"$set": document_to_update})
        print("[DBHelper] Document Updated", result.modified_count)
        return result

    def delete_document(self, condition):
        result = self.collection.delete_one(condition)
        print("[DBHelper] Document Deleted", result.deleted_count)
        return result
