document.addEventListener('DOMContentLoaded', function() {
    const common_switch = document.getElementById('common-switch');
    common_switch.addEventListener("change", async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        chrome.tabs.sendMessage(tab.id, {
            action: "commonSwitchChanged",
            enabled: common_switch.checked
        });
    });

    const anticheat_switch = document.getElementById('anticheat-switch');
    anticheat_switch.addEventListener("change", async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        chrome.tabs.sendMessage(tab.id, {
            action: "anticheatSwitchChanged",
            enabled: anticheat_switch.checked
        });
    });
});