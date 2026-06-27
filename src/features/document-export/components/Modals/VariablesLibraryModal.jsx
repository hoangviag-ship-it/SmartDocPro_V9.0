import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Search, Save, AlertCircle } from "lucide-react";
import { inferVariableType } from "../../utils/variableUtils";

export default function VariablesLibraryModal({ isOpen, onClose, globalDictionary, setGlobalDictionary, showToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [variables, setVariables] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({ type: "text", synonyms: "", description: "", defaultValue: "" });
  const [newVarName, setNewVarName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (globalDictionary) {
      const varsArray = Object.entries(globalDictionary).map(([key, config]) => ({
        key,
        ...config,
      }));
      setVariables(varsArray);
    }
  }, [globalDictionary]);

  if (!isOpen) return null;

  const handleSaveEdit = () => {
    if (!editingKey && !newVarName.trim()) {
      showToast("Tên biến không được để trống", "error");
      return;
    }

    const targetKey = editingKey || newVarName.trim();

    if (isAddingNew && globalDictionary[targetKey]) {
      showToast("Biến này đã tồn tại trong thư viện!", "warning");
      return;
    }

    const updatedSynonyms = editForm.synonyms
      ? editForm.synonyms.split(",").map(s => s.trim()).filter(s => s)
      : [];

    setGlobalDictionary(prev => ({
      ...prev,
      [targetKey]: {
        type: editForm.type,
        synonyms: updatedSynonyms,
        description: editForm.description,
        defaultValue: editForm.defaultValue,
      }
    }));

    setEditingKey(null);
    setIsAddingNew(false);
    setNewVarName("");
    showToast(`Đã lưu biến ${targetKey} thành công!`, "success");
  };

  const handleEdit = (v) => {
    setEditingKey(v.key);
    setIsAddingNew(false);
    setEditForm({
      type: v.type || "text",
      synonyms: v.synonyms ? v.synonyms.join(", ") : "",
      description: v.description || "",
      defaultValue: v.defaultValue || ""
    });
  };

  const handleDelete = (key) => {
    if (window.confirm(`Bạn có chắc muốn xóa biến ${key} khỏi thư viện?`)) {
      setGlobalDictionary(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      showToast(`Đã xóa biến ${key}`, "success");
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingKey(null);
    setNewVarName("");
    setEditForm({ type: "text", synonyms: "", description: "", defaultValue: "" });
  };

  const filteredVars = variables.filter(v => 
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Thư viện Biến Thông minh
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 flex gap-4 items-center border-b border-slate-700">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm biến..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            <Plus size={18} /> Thêm Biến
          </button>
        </div>

        {/* Editor Form (if editing/adding) */}
        {(editingKey || isAddingNew) && (
          <div className="p-4 bg-slate-800 border-b border-indigo-500/50">
            <h3 className="text-lg font-medium text-white mb-4">
              {isAddingNew ? "Thêm Biến Mới" : `Chỉnh sửa: ${editingKey}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAddingNew && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tên Biến (Mã)</label>
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s+/g, '_');
                      setNewVarName(val);
                      if (val && editForm.type === 'text') {
                        setEditForm(prev => ({ ...prev, type: inferVariableType(val) }));
                      }
                    }}
                    placeholder="VD: Ten_Khach_Hang"
                    className="w-full bg-slate-900 text-white px-3 py-2 border border-slate-700 rounded focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kiểu Dữ liệu</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-900 text-white px-3 py-2 border border-slate-700 rounded focus:outline-none focus:border-indigo-500"
                >
                  <option value="text">Văn bản (Text)</option>
                  <option value="date">Ngày tháng (Date)</option>
                  <option value="currency">Tiền tệ (Currency)</option>
                  <option value="number">Số (Number)</option>
                  <option value="email">Email</option>
                  <option value="phone">Số điện thoại (Phone)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Giá trị mặc định</label>
                <input
                  type="text"
                  value={editForm.defaultValue}
                  onChange={(e) => setEditForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                  placeholder="Để trống nếu không có"
                  className="w-full bg-slate-900 text-white px-3 py-2 border border-slate-700 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Từ đồng nghĩa (Cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={editForm.synonyms}
                  onChange={(e) => setEditForm(prev => ({ ...prev, synonyms: e.target.value }))}
                  placeholder="VD: TenKH, CustomerName, Ten_K_H"
                  className="w-full bg-slate-900 text-white px-3 py-2 border border-slate-700 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Ghi chú / Mô tả</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-900 text-white px-3 py-2 border border-slate-700 rounded focus:outline-none focus:border-indigo-500"
                  placeholder="Mô tả ý nghĩa biến này..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setEditingKey(null); setIsAddingNew(false); }}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2"
              >
                <Save size={16} /> Lưu Thay Đổi
              </button>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredVars.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có biến nào trong thư viện hoặc không tìm thấy kết quả.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredVars.map(v => (
                <div key={v.key} className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-white text-lg">{v.key}</span>
                      <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {v.type || "text"}
                      </span>
                    </div>
                    {v.description && <p className="text-slate-400 text-sm mb-2">{v.description}</p>}
                    
                    {v.synonyms && v.synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-slate-500 mr-1">Đồng nghĩa:</span>
                        {v.synonyms.map(syn => (
                          <span key={syn} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-700 text-slate-300">
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(v)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                      title="Sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(v.key)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
