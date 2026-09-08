import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    ignores: ["node_modules/**", ".next/**", "lib/generated/**"],
  },
];

export default eslintConfig;
