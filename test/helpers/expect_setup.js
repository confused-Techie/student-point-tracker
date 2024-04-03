// Add custom expect methods
expect.extend({
  // `expect().toBeArray()`
  toBeArray(value) {
    if (Array.isArray(value)) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected Array but received: ${this.utils.printReceived(value)}`,
      };
    }
  },
  // `expect().toBeTypeof(typeof)`
  toBeTypeof(actual, want) {
    if (typeof actual === want) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () => `Expected "${want}" but got "${typeof actual}"`,
      };
    }
  },
  // `expect().toBeIncludedBy(ARRAY)`
  toBeIncludedBy(actual, want) {
    if (Array.isArray(want) && want.includes(actual)) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () => `Expected ${want} to include ${actual}`,
      };
    }
  },
});
