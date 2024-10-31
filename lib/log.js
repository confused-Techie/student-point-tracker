module.exports =
class Log {
  constructor(server) {
    this.server = server;
    this.date = new Date().toISOString();

    this.logCache = {
      system: []
    };
  }

  // Public Methods
  debug(data) { this.log(data, 7); } // Debug-Level Messages
  info(data) { this.log(data, 6); } // Informational Messages
  notice(data) { this.log(data, 5); } // Normal but significant conditions
  warn(data) { this.log(data, 4); } // Warning conditions
  err(data) { this.log(data, 3); } // Error conditions
  crit(data) { this.log(data, 2); } // Critical conditions
  alert(data) { this.log(data, 1); } // Action must be taken immediately
  panic(data) { this.log(data, 0); } // System is unusable

  // Private
  log(data, lvl = 1) {
    let gelf = {};

    if (typeof data === "string") {
      // We have been provided only a string message, and must infer all other fields
      gelf.short_message = data;
    } else {
      // We have been provided an object of data, lets add it all to our object,
      // then infer any final fields that are needed
      for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith("_") && !this.isStandardGelfField(key)) {
          // If the key doesn't already start with an underscore, and is not a
          // standard field, we must ensure to prepend it with an underscore
          gelf[`_${key}`] = value;
        } else {
          // Otherwise it's either a standard gelf key, or it already has an underscore
          gelf[key] = value;
        }
      }
    }

    // Now with all fields provided added to the object, lets check for anything
    // missing and add whatever else we have

    if (this.isSuppliedString(gelf.version)) {
      gelf.version = "1.1";
    }
    if (this.isSuppliedString(gelf.host)) {
      gelf.host = "stp";
    }
    if (this.isSuppliedString(gelf.short_message)) {
      if (this.isSuppliedString(gelf.full_message)) {
        gelf.short_message = gelf.full_message;
      } else {
        gelf.short_message = "No data being logged...";
      }
    }
    if (this.isSuppliedString(gelf.timestamp)) {
      gelf.timestamp = Date.now();
    }
    if (this.isSuppliedString(gelf.level)) {
      gelf.level = lvl;
    }
    if (this.isSuppliedString(gelf["_facility"])) {

    }
  }

  // Util
  isStandardGelfField(field) {
    const standardFields = [
      "version", "host", "short_message", "full_message", "timestamp", "level"
    ];

    return standardFields.includes(field);
  }

  isSuppliedString(value) {
    if (typeof value === "string" && value.length > 0) {
      return true;
    } else {
      return false;
    }
  }

}
