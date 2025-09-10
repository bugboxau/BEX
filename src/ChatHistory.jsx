import React from "react";

/**
 * Slim, controlled sidebar. Parent (App.jsx) owns the data.
 * Props:
 * - convos: [{id, title, preview?}]
 * - activeId
 * - onNewChat()
 * - onSelect(id)
 * - onRename(id, title)
 * - onDelete(id)
 */
export default function ChatHistory({
  convos,
  activeId,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
  sidebarOpen = true,
}) {
  return (
    <aside className="bbx-slim-sidebar">
      <div className="bbx-slim-head">
        <button className="bbx-slim-icon" title="New chat" onClick={onNewChat}>＋</button>
        <button
          className="bbx-slim-icon"
          title="Rename"
          onClick={() => {
            const current = convos.find(c => c.id === activeId);
            const t = prompt("Rename conversation:", current?.title ?? "");
            if (t) onRename?.(activeId, t.trim());
          }}
          disabled={!activeId}
        >
          ✎
        </button>
        <button
          className="bbx-slim-icon danger"
          title="Delete"
          onClick={() => activeId && onDelete?.(activeId)}
          disabled={!activeId}
        >
          🗑
        </button>
      </div>

      <div className="bbx-slim-list">
        {convos.map(c => {
          const isActive = c.id === activeId;
          return (
            <div
              key={c.id}
              className={`bbx-slim-item ${isActive ? "active" : ""}`}
              onClick={() => onSelect?.(c.id)}
              title={c.title}
            >
              <div className="bbx-slim-title">{c.title}</div>
              <div className="bbx-slim-preview">{c.preview || " "}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
