import { buildRepository } from "./build.mjs";
import { createStaticServer } from "./serve.mjs";
const { output } = await buildRepository();
const port = Number(process.env.PORT || 4173);
const server = createStaticServer({ root: output, basePath: "/001_Public/" });
server.on("error", (e) => {
  console.error(e.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Preview: http://127.0.0.1:${port}/001_Public/applications/`),
);
