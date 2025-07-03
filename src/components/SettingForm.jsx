import React from "react";

function SettingForm({remindCardDueDate, setRemindCardDueDate, addEditSettings, settingsListEditID}) {
  return (
    <div className="settings-panel">
      <input
        type="number"
        placeholder="Enter days to remind due date"
        value={remindCardDueDate}
        onChange={(e) => setRemindCardDueDate(e.target.value)}
      />
      <button onClick={addEditSettings}>
        {settingsListEditID === null ? "Add" : "Update"}
      </button>
    </div>
  );
}
export { SettingForm };
