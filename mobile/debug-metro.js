try {
    console.log("Attempting to require @expo/metro-config...");
    const { getDefaultConfig } = require("@expo/metro-config");
    console.log("Success.");

    console.log("Attempting to require nativewind/metro...");
    const { withNativeWind } = require("nativewind/metro");
    console.log("Success.");

    console.log("Attempting to load metro.config.js...");
    const config = require("./metro.config.js");
    console.log("Config loaded successfully:", Object.keys(config));
} catch (error) {
    console.error("CRITICAL ERROR LOADING CONFIG:");
    console.error(error);
}
