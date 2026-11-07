import { store, replace, panel, form, field, input, el } from "./shell.js";
const db = store(
  "{{APP_ID}}",
  [],
  (x) => Array.isArray(x) && x.every((s) => typeof s === "string"),
);
function render() {
  replace(
    panel(
      "Your new workspace",
      form(
        [
          field(
            "A note",
            input("note", "", { required: true, maxlength: 200 }),
          ),
        ],
        (data) => {
          const text = data.get("note").trim();
          if (!text) throw new Error("Enter a note.");
          db.set([...db.get(), text]);
          render();
        },
        "Save note",
      ),
      el("ul", {}, ...db.get().map((text) => el("li", {}, text))),
    ),
  );
}
render();
