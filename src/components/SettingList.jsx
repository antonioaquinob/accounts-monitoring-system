import React from "react";

function SettingList({
  setting,
  settingsListEditID,
  startSettingsEdit,
  deleteSettings,
}) {
  return (
    <div key={setting.id}>
      <p>Remind card due date before: {setting.remindCardDueDate}</p>

      {settingsListEditID === null && (
        <button onClick={() => startSettingsEdit(setting)}>Edit</button>
      )}
      <button onClick={() => deleteSettings(setting.id)}>Delete</button>
    </div>
  );
}

export { SettingList };
