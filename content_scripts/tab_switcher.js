//
// This wraps the tab switcher iframe, which shows a horizontal row of tab icons
// when cycling through tabs with nextTab/previousTab.
//
const TabSwitcher = {
  tabSwitcherUI: null,
  hideTimer: null,

  init() {
    if (!this.tabSwitcherUI) {
      this.tabSwitcherUI = new UIComponent();
      this.tabSwitcherUI.load("pages/tab_switcher_page.html", "vimium-tab-switcher-frame");
    }
  },

  // Shows the tab switcher with the given tab data.
  // tabData: { allTabs: [{url, title, index}], activeTabIndex: number }
  async show(tabData) {
    this.init();

    // Clear any existing hide timer.
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    // Calculate how many tabs can fit based on window width.
    // Each icon is 32px + 8px gap = 40px, plus 32px total padding.
    const windowWidth = window.innerWidth;
    const iconWidth = 40; // 32px icon + 8px gap
    const containerPadding = 32; // 16px on each side
    const maxTabsThatFit = Math.floor((windowWidth * 0.8 - containerPadding) / iconWidth);

    // Use at least 5 tabs, and cap at a reasonable maximum.
    const maxVisibleTabs = Math.max(5, Math.min(maxTabsThatFit, 30));
    const halfWindow = Math.floor(maxVisibleTabs / 2);

    const allTabs = tabData.allTabs;
    const activeTabIndex = tabData.activeTabIndex;

    let start, end;
    if (allTabs.length <= maxVisibleTabs) {
      // Show all tabs if there are fewer than max.
      start = 0;
      end = allTabs.length;
    } else {
      // Try to center the active tab, but adjust if near the edges to always show maxVisibleTabs.
      start = Math.max(0, Math.min(activeTabIndex - halfWindow, allTabs.length - maxVisibleTabs));
      end = start + maxVisibleTabs;
    }

    const visibleTabs = allTabs.slice(start, end);
    const adjustedTabData = {
      tabs: visibleTabs,
      activeIndex: activeTabIndex - start,
      hasMoreLeft: start > 0,
      hasMoreRight: end < allTabs.length,
    };

    await this.tabSwitcherUI.show(
      { name: "show", tabData: adjustedTabData },
      { focus: false }
    );

    // Auto-hide after 1 second.
    this.hideTimer = setTimeout(() => {
      this.hide();
    }, 1000);
  },

  hide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.tabSwitcherUI) {
      this.tabSwitcherUI.hide(false);
    }
  },
};

globalThis.TabSwitcher = TabSwitcher;
