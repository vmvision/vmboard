import esbuild from "esbuild";

try {
  esbuild
    .build({
      entryPoints: {
        server: "src/server.ts",
      },
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node18",
      outExtension: { ".js": ".mjs" },
      minify: true,
      sourcemap: true,
      outdir: "dist",
      tsconfig: "tsconfig.json",
      packages: "external",
    })
    .catch(() => {
      return process.exit(1);
    });
} catch (error) {
  console.log(error);
}
