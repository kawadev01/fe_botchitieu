"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import TiptapToolbar from "./TiptapToolbar";

interface ContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
}) => {
  const [isCodeView, setIsCodeView] = useState(false);
  const [codeContent, setCodeContent] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem,
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate({ editor }) {
      if (!isCodeView) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose max-w-none dark:prose-invert min-h-[200px] px-4 py-3 focus:outline-none bg-white dark:bg-slate-800 rounded-b-lg",
      },
    },
  });

  useEffect(() => {
    if (editor && !isCodeView && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, isCodeView]);

  useEffect(() => {
    if (isCodeView) {
      setCodeContent(value);
    }
  }, [isCodeView, value]);

  const onCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodeContent(e.target.value);
  };

  const toggleCodeView = () => {
    if (isCodeView) {
      onChange(codeContent);
      if (editor) {
        editor.commands.setContent(codeContent);
      }
    }
    setIsCodeView(!isCodeView);
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}>
      <TiptapToolbar editor={editor} isCodeView={isCodeView} toggleCodeView={toggleCodeView} />
      {isCodeView ? (
        <textarea
          className="w-full min-h-[300px] p-2 font-mono text-sm bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-b-lg"
          value={codeContent}
          onChange={onCodeChange}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
};

export default ContentEditor;
