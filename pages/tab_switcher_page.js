import "../lib/utils.js";
import * as UIComponentMessenger from "./ui_component_messenger.js";

const TabSwitcherPage = {
  isFirefox: false,

  init() {
    chrome.runtime.sendMessage({ handler: "getBrowserInfo" }).then((info) => {
      this.isFirefox = info.isFirefox;
    });
  },

  // Renders the tab switcher with the given tab data.
  // tabData: { tabs: [{url, title, index}], activeIndex: number, hasMoreLeft: boolean, hasMoreRight: boolean }
  show(tabData) {
    const container = document.getElementById("tab-icons");
    container.innerHTML = "";

    if (!tabData || !tabData.tabs || tabData.tabs.length === 0) {
      return;
    }

    // Add left indicator if there are more tabs to the left.
    if (tabData.hasMoreLeft) {
      const leftIndicator = document.createElement("div");
      leftIndicator.className = "tab-indicator";
      leftIndicator.textContent = "◀";
      container.appendChild(leftIndicator);
    }

    for (let i = 0; i < tabData.tabs.length; i++) {
      const tab = tabData.tabs[i];
      const isActive = i === tabData.activeIndex;

      const iconDiv = document.createElement("div");
      iconDiv.className = "tab-icon" + (isActive ? " active" : "");

      if (this.isFirefox) {
        // Firefox fallback: show tab index number.
        const fallbackText = document.createElement("span");
        fallbackText.className = "fallback-text";
        fallbackText.textContent = String(tab.index + 1);
        iconDiv.appendChild(fallbackText);
      } else {
        // Chrome: show favicon.
        const favicon = document.createElement("img");
        const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
        faviconUrl.searchParams.set("pageUrl", tab.url);
        faviconUrl.searchParams.set("size", "20");
        favicon.src = faviconUrl.toString();
        favicon.onerror = () => {
          // If favicon fails to load, show tab index as fallback.
          favicon.remove();
          const fallbackText = document.createElement("span");
          fallbackText.className = "fallback-text";
          fallbackText.textContent = String(tab.index + 1);
          iconDiv.appendChild(fallbackText);
        };
        iconDiv.appendChild(favicon);
      }

      container.appendChild(iconDiv);
    }

    // Add right indicator if there are more tabs to the right.
    if (tabData.hasMoreRight) {
      const rightIndicator = document.createElement("div");
      rightIndicator.className = "tab-indicator";
      rightIndicator.textContent = "▶";
      container.appendChild(rightIndicator);
    }
  },
};

UIComponentMessenger.init();
UIComponentMessenger.registerHandler((message) => {
  if (message.data && message.data.name === "show") {
    TabSwitcherPage.show(message.data.tabData);
  }
});

TabSwitcherPage.init();
