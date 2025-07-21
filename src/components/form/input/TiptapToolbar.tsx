import React, { useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
  BoldIcon, ItalicIcon, StrikethroughIcon, CodeIcon,
  ParagraphIcon, Heading1Icon, Heading2Icon, BulletListIcon,
  OrderedListIcon, LinkIcon, UnlinkIcon, ImageIcon, UndoIcon,
  RedoIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon,
  MinusIcon, TableIcon
} from "./TiptapIcons";

interface TiptapToolbarProps {
  editor: Editor | null;
  isCodeView: boolean;
  toggleCodeView: () => void;
}

const buttonClass = (isActive: boolean) =>
  `p-2 rounded-md transition-colors text-sm ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-black hover:bg-gray-300"}`;

const TiptapToolbar: React.FC<TiptapToolbarProps> = ({ editor, isCodeView, toggleCodeView }) => {
  if (!editor) return null;

  const promptUrl = (message: string, current?: string) => window.prompt(message, current || "")?.trim();

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = promptUrl("Nhập liên kết:", prev);
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = promptUrl("Nhập URL ảnh:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border-b bg-gray-50 rounded-t-md">
      {/* Các nút có sẵn */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive("bold"))}><BoldIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive("italic"))}><ItalicIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonClass(editor.isActive("strike"))}><StrikethroughIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={buttonClass(editor.isActive("code"))}><CodeIcon /></button>

      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={buttonClass(editor.isActive("paragraph"))}><ParagraphIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass(editor.isActive("heading", { level: 1 }))}><Heading1Icon /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive("heading", { level: 2 }))}><Heading2Icon /></button>

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive("bulletList"))}><BulletListIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive("orderedList"))}><OrderedListIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()} className={buttonClass(editor.isActive("taskList"))}>📝</button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={buttonClass(false)}><MinusIcon /></button>

      <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={buttonClass(editor.isActive({ textAlign: "left" }))}><AlignLeftIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={buttonClass(editor.isActive({ textAlign: "center" }))}><AlignCenterIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={buttonClass(editor.isActive({ textAlign: "right" }))}><AlignRightIcon /></button>

      <button type="button" onClick={setLink} className={buttonClass(editor.isActive("link"))}><LinkIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={buttonClass(false)}><UnlinkIcon /></button>
      <button type="button" onClick={addImage} className={buttonClass(false)}><ImageIcon /></button>

      <button type="button" onClick={addTable} className={buttonClass(false)}><TableIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={buttonClass(false)}><UndoIcon /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={buttonClass(false)}><RedoIcon /></button>

      {/* Nút chuyển đổi code view */}
      <button
        type="button"
        onClick={toggleCodeView}
        className={`p-2 rounded-md text-sm ${
          isCodeView ? "bg-red-600 text-white" : "bg-gray-200 text-black hover:bg-gray-300"
        }`}
        title="Chuyển đổi chế độ chỉnh sửa HTML"
      >
        {"</>"}
      </button>
    </div>
  );
};

export default TiptapToolbar;
