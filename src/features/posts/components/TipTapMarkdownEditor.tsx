import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Smile,
  Unlink,
} from 'lucide-react';
import { Extension } from '@tiptap/core';

interface TipTapMarkdownEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// Create custom extension for better code handling
const CodeEscapeExtension = Extension.create({
  name: 'codeEscape',
  
  addKeyboardShortcuts() {
    return {
      // Press Escape to exit code formatting
      'Escape': () => {
        if (this.editor.isActive('code')) {
          this.editor.chain().focus().unsetCode().run();
          return true;
        }
        return false;
      },
      
      // Press Space twice to exit code formatting
      'Space Space': () => {
        if (this.editor.isActive('code')) {
          this.editor.chain().focus().unsetCode().run();
          return true;
        }
        return false;
      },
      
      // Press Enter to potentially exit code formatting
      'Enter': () => {
        if (this.editor.isActive('code')) {
          // Add a space and exit code formatting
          this.editor.chain().focus().insertContent(' ').unsetCode().run();
          return true;
        }
        return false;
      }
    };
  },
});

export const TipTapMarkdownEditor: React.FC<TipTapMarkdownEditorProps> = ({
  content,
  onChange,
  placeholder = `What's on your mind? 
Share your thoughts, stories, or updates with your audience... 😊`,
  maxLength = 2500,
  className = "",
}) => {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Disable CodeBlock to prevent conflicts with inline code
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Underline,
      Markdown.configure({
        html: false,
        tightLists: true,
        bulletListMarker: '-',
        transformPastedText: true,
        transformCopiedText: true,
        breaks: false,
        linkify: false,
      }),
      CodeEscapeExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      let markdown = editor.storage.markdown.getMarkdown();
      
      markdown = markdown
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')');
      
      console.log('🔄 TipTap onUpdate:');
      console.log('  Raw markdown:', markdown);
      console.log('  Cleaned markdown:', markdown);
      console.log('  Character count:', markdown.length);
      
      const count = markdown.length;
      setCharacterCount(count);
      onChange(markdown);
    },
    onCreate: ({ editor }) => {
      let markdown = editor.storage.markdown.getMarkdown();
      
      markdown = markdown
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')');
      
      const count = markdown.length;
      setCharacterCount(count);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-4 py-3 ${className}`,
      },
      handleKeyDown: (view, event) => {
        // Handle Enter key to break out of code formatting
        if (event.key === 'Enter' && editor?.isActive('code')) {
          // If we're in code and press Enter, create a new line and clear code formatting
          const { tr } = view.state;
          const { selection } = tr;
          
          // Insert line break and remove code mark
          editor.chain()
            .focus()
            .insertContent('<br>')
            .unsetCode()
            .run();
          
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content === '' && editor.getText().length > 0) {
      editor.commands.setContent('');
      setCharacterCount(0);
    }
  }, [editor, content]);

  const openLinkModal = () => {
    const { from, to } = editor?.state.selection || {};
    const selectedText = editor?.state.doc.textBetween(from || 0, to || 0) || '';
    
    setLinkText(selectedText);
    setLinkUrl('');
    setLinkTitle('');
    setLinkModalOpen(true);
  };

  const handleLinkSubmit = () => {
    if (!linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('mailto:')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (editor) {
      let markdownLink = '';
      
      if (linkText.trim() && linkText.trim() !== formattedUrl) {
        markdownLink = `[${linkText.trim()}](${formattedUrl}${linkTitle.trim() ? ` "${linkTitle.trim()}"` : ''})`;
      } else {
        markdownLink = `[${formattedUrl}](${formattedUrl})`;
      }

      editor.chain().focus().deleteSelection().insertContent(markdownLink).run();
    }

    setLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    setLinkTitle('');
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData.emoji).run();
      setEmojiPickerOpen(false);
    }
  };

  const formatButtons = [
    {
      icon: Bold,
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: editor?.isActive('bold'),
      label: 'Bold',
    },
    {
      icon: Italic,
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: editor?.isActive('italic'),
      label: 'Italic',  
    },
    {
      icon: UnderlineIcon,
      action: () => editor?.chain().focus().toggleUnderline().run(),
      isActive: editor?.isActive('underline'),
      label: 'Underline',
    },
    {
      icon: Heading1,
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor?.isActive('heading', { level: 1 }),
      label: 'Heading 1',
    },
    {
      icon: Heading2,
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor?.isActive('heading', { level: 2 }),
      label: 'Heading 2',
    },
    {
      icon: List,
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: editor?.isActive('bulletList'),
      label: 'Bullet List',
    },
    {
      icon: ListOrdered,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: editor?.isActive('orderedList'),
      label: 'Numbered List',
    },
    {
      icon: Quote,
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: editor?.isActive('blockquote'), // Fixed: was 'bulletList'
      label: 'Quote',
    },
    {
      icon: Code,
      action: () => {
        // Better toggle logic
        if (editor?.isActive('code')) {
          editor.chain().focus().unsetCode().run();
        } else {
          editor.chain().focus().toggleCode().run();
        }
      },
      isActive: editor?.isActive('code'),
      label: 'Inline Code',
    },
  ];

  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        {/* Toolbar */}
        <div className="border-b bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
          {formatButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant={button.isActive ? "default" : "ghost"}
              size="sm"
              onClick={button.action}
              className="h-8 w-8 p-0"
              title={button.label}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
          
          {/* Single Link Button - Opens Dialog */}
          <Button
            type="button"
            variant={editor?.isActive('link') ? "default" : "ghost"}
            size="sm"
            onClick={openLinkModal}
            className="h-8 w-8 p-0"
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          {/* Remove Link Button - Only shows when on a link */}
          {editor?.isActive('link') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeLink}
              className="h-8 w-8 p-0"
              title="Remove Link"
            >
              <Unlink className="h-4 w-4" />
            </Button>
          )}
          
          {/* Emoji Picker Button */}
          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Add Emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0 shadow-lg">
              <EmojiPicker 
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                skinTonesDisabled
                width={320}
                height={400}
              />
            </PopoverContent>
          </Popover>
          
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="relative">
          <EditorContent 
            editor={editor} 
            className="prose-editor"
          />
        </div>

        {/* Footer with character count */}
        <div className="border-t bg-gray-50 dark:bg-gray-800 px-3 py-2 flex justify-between items-center text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            ✨ Express yourself • Format with ease • Share your story 🚀
          </div>
          <div className={`font-medium transition-colors ${
            isOverLimit 
              ? 'text-red-600' 
              : isNearLimit 
                ? 'text-amber-600' 
                : 'text-gray-600 dark:text-gray-400'
          }`}>
            {characterCount.toLocaleString()}/{maxLength.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-lg backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              Create Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">📝 Examples:</h4>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div><strong>Standard:</strong> [https://pepay.io](https://pepay.io)</div>
                <div><strong>Custom text:</strong> [Visit PePay](https://pepay.io)</div>
                <div><strong>With tooltip:</strong> [PePay](https://pepay.io "PePay Platform")</div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="link-text" className="text-sm font-medium">
                Link Text (Display Text)
              </Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g., Visit PePay, Click here, etc."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 Leave empty to use the URL as the display text
              </p>
            </div>
            
            <div>
              <Label htmlFor="link-url" className="text-sm font-medium">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                🌐 Will auto-add https:// if missing
              </p>
            </div>
            
            <div>
              <Label htmlFor="link-title" className="text-sm font-medium">
                Title (Tooltip)
              </Label>
              <Input
                id="link-title"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="e.g., Visit the PePay platform"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💬 Shows when users hover over the link
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setLinkModalOpen(false)}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLinkSubmit}
              disabled={!linkUrl.trim()}
              className="min-w-[80px] bg-blue-500 hover:bg-blue-600"
            >
              Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};