from flask import Blueprint, jsonify, make_response, request
import os
import uuid
from datetime import datetime

memory_bp = Blueprint("memory", __name__)

class Memory:
    def __init__(self):
        self.memories = {}
        self.user_memories = {}
    
    def add(self, data, user_id=None, metadata=None):
        """Save a new memory."""
        memory_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        memory = {
            "id": memory_id,
            "data": data,
            "user_id": user_id,
            "metadata": metadata or {},
            "created_at": timestamp,
            "updated_at": timestamp,
            "history": [{
                "timestamp": timestamp,
                "data": data
            }]
        }
        
        self.memories[memory_id] = memory
        
        if user_id:
            if user_id not in self.user_memories:
                self.user_memories[user_id] = []
            self.user_memories[user_id].append(memory_id)
        
        return {"id": memory_id, "success": True}
    
    def get(self, memory_id):
        """Get a memory by ID."""
        return self.memories.get(memory_id)
    
    def get_all(self, user_id=None):
        """Get all memories for a user."""
        if not user_id:
            return list(self.memories.values())
        
        user_memory_ids = self.user_memories.get(user_id, [])
        return [self.memories[mid] for mid in user_memory_ids if mid in self.memories]
    
    def search(self, query, user_id=None):
        """Find memories related to the query."""
        # Simple search implementation - in real app, use vector similarity
        results = []
        
        memories_to_search = self.get_all(user_id) if user_id else list(self.memories.values())
        
        for memory in memories_to_search:
            # Check if query exists in the memory data (assuming data is string or has string representation)
            if isinstance(memory["data"], str) and query.lower() in memory["data"].lower():
                results.append(memory)
            elif isinstance(memory["data"], list):
                # For message histories or other list data
                for item in memory["data"]:
                    if isinstance(item, dict) and "content" in item:
                        if query.lower() in item["content"].lower():
                            results.append(memory)
                            break
        
        return results
    
    def update(self, memory_id, data):
        """Update a memory."""
        if memory_id not in self.memories:
            return {"success": False, "error": "Memory not found"}
        
        timestamp = datetime.now().isoformat()
        
        memory = self.memories[memory_id]
        memory["data"] = data
        memory["updated_at"] = timestamp
        memory["history"].append({
            "timestamp": timestamp,
            "data": data
        })
        
        return {"id": memory_id, "success": True}
    
    def history(self, memory_id):
        """Get the history of a memory."""
        if memory_id not in self.memories:
            return {"success": False, "error": "Memory not found"}
        
        return self.memories[memory_id]["history"]
    
    def delete(self, memory_id):
        """Delete a memory."""
        if memory_id not in self.memories:
            return {"success": False, "error": "Memory not found"}
        
        memory = self.memories.pop(memory_id)
        
        if memory["user_id"] and memory["user_id"] in self.user_memories:
            if memory_id in self.user_memories[memory["user_id"]]:
                self.user_memories[memory["user_id"]].remove(memory_id)
        
        return {"success": True}
    
    def delete_all(self, user_id=None):
        """Delete all memories for a user."""
        if user_id:
            if user_id not in self.user_memories:
                return {"success": False, "error": "User not found"}
            
            memory_ids = self.user_memories[user_id].copy()
            for mid in memory_ids:
                self.delete(mid)
            
            self.user_memories[user_id] = []
        else:
            self.memories = {}
            self.user_memories = {}
        
        return {"success": True}
    
    def reset(self):
        """Reset all memories."""
        self.memories = {}
        self.user_memories = {}
        return {"success": True}


# Create a global Memory instance
memory = Memory()

# API routes for memory
@memory_bp.route("/api/memory", methods=["POST"])
def add_memory():
    try:
        data = request.get_json()
        memory_data = data.get("data")
        user_id = data.get("user_id")
        metadata = data.get("metadata")
        
        result = memory.add(memory_data, user_id, metadata)
        return make_response(jsonify(result), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 400)

@memory_bp.route("/api/memory/<memory_id>", methods=["GET"])
def get_memory(memory_id):
    result = memory.get(memory_id)
    if result:
        return make_response(jsonify(result), 200)
    return make_response(jsonify({"error": "Memory not found"}), 404)

@memory_bp.route("/api/memory/user/<user_id>", methods=["GET"])
def get_user_memories(user_id):
    result = memory.get_all(user_id)
    return make_response(jsonify(result), 200)

@memory_bp.route("/api/memory/search", methods=["POST"])
def search_memories():
    data = request.get_json()
    query = data.get("query")
    user_id = data.get("user_id")
    
    if not query:
        return make_response(jsonify({"error": "Query is required"}), 400)
    
    result = memory.search(query, user_id)
    return make_response(jsonify(result), 200)

@memory_bp.route("/api/memory/<memory_id>", methods=["PUT"])
def update_memory(memory_id):
    data = request.get_json()
    memory_data = data.get("data")
    
    if not memory_data:
        return make_response(jsonify({"error": "Data is required"}), 400)
    
    result = memory.update(memory_id, memory_data)
    if result.get("success"):
        return make_response(jsonify(result), 200)
    return make_response(jsonify(result), 404)

@memory_bp.route("/api/memory/<memory_id>/history", methods=["GET"])
def get_memory_history(memory_id):
    result = memory.history(memory_id)
    if isinstance(result, list):
        return make_response(jsonify(result), 200)
    return make_response(jsonify(result), 404)

@memory_bp.route("/api/memory/<memory_id>", methods=["DELETE"])
def delete_memory(memory_id):
    result = memory.delete(memory_id)
    if result.get("success"):
        return make_response(jsonify(result), 200)
    return make_response(jsonify(result), 404)

@memory_bp.route("/api/memory/user/<user_id>", methods=["DELETE"])
def delete_user_memories(user_id):
    result = memory.delete_all(user_id)
    if result.get("success"):
        return make_response(jsonify(result), 200)
    return make_response(jsonify(result), 404)

@memory_bp.route("/api/memory/reset", methods=["POST"])
def reset_memories():
    result = memory.reset()
    return make_response(jsonify(result), 200) 