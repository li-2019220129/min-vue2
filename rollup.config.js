import babel from "rollup-plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
export default {
  // ...
  input: "./src/index.js",
  output: {
    file: "./dist/vue.js",
    name: "Vue",
    format: "umd",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: "node_modules/**",
    }),
  ],
};
