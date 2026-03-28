import "react-quill/dist/quill.snow.css";

import ReactQuill from "react-quill";

const modules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ header: [1, 2, 3, false] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "bold",
  "italic",
  "underline",
  "header",
  "list",
  "bullet",
  "link",
];

export function ContentEditor({ value, onChange }) {
  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      translate="no"
    >
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Content editor
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Refine the generated copy before saving.
        </h2>
      </div>

      <div className="p-6">
        <div className="content-editor notranslate" translate="no">
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}
