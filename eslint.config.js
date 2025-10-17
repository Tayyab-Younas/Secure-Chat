// eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },

    rules: {
      camelcase: [
        "error",
        {
          properties: "always",
          allow: ["cloud_name", "api_key", "api_secret", "allowed_formats"],
        },
      ],
      "no-unused-vars": "warn",
      semi: ["error", "always"],
    },
  },
];
