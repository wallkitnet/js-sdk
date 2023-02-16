const Resource = {
  formatKey: (key, resource) => {
    return `${key}_${resource}`;
  }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Resource;
}
