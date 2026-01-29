import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu, mergeAttributes } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  Sparkles,
  Heading1,
  Heading2,
  Quote,
  ListOrdered,
  Link as LinkIcon,
  Check,
  X,
} from 'lucide-react';
import { Button, Separator, Input } from '../ui';
import { cn } from '@/lib/utils';
import { getAxiosInstance } from '@/lib/axios-utils';

const isUrl = (text: string) => {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onAICall?: (selectedText: string, fullText: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string | number;
  id?: string;
  enableSlashMenu?: boolean;
  canShowAIOptions?: boolean;
  classNameEditor?: string;
  readingMode?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onAICall,
  placeholder = 'Type / for commands or start writing...',
  className: classNameRoot = '',
  classNameEditor = '',
  minHeight = 'unset',
  id = '',
  enableSlashMenu = false,
  canShowAIOptions = false,
  readingMode = false,
}) => {
  const fetchAndUpdateLinkMetadata = (url: string) => {
    if (!editor) return;

    // Generate a unique marker to find this specific link in the editor
    const markerId = `link-${Math.random().toString(36).slice(2, 9)}`;

    // Show only the URL text during loading (no icons)
    editor.chain().focus().insertContent(`<a href="${url}" data-marker="${markerId}">${url}</a>`).run();

    // Fetch metadata
    getAxiosInstance()
      .get(`/link-metadata?url=${encodeURIComponent(url)}`)
      .then((res: any) => {
        if (!res) return;
        const { title, image = `https://www.google.com/s2/favicons?domain=${url}`, description } = res;
        const finalTitle = title || url;

        // Find the node by marker in the document structure
        let foundPos = -1;
        let nodeSize = 0;

        editor.state.doc.descendants((node, pos) => {
          if (node.isText) {
            const mark = node.marks.find((m) => m.type.name === 'link' && m.attrs['data-marker'] === markerId);
            if (mark) {
              foundPos = pos;
              nodeSize = node.nodeSize;
              return false;
            }
          }
          return true;
        });

        if (foundPos !== -1) {
          editor
            .chain()
            .deleteRange({ from: foundPos, to: foundPos + nodeSize })
            .insertContent(`<a href="${url}" data-image="${image || ''}" data-description="${description || ''}">${finalTitle}</a>`)
            .run();
        }
      })
      .catch(() => {
        // Fallback: remove marker but keep URL text
        editor.state.doc.descendants((node, pos) => {
          if (node.isText) {
            const mark = node.marks.find((m) => m.type.name === 'link' && m.attrs['data-marker'] === markerId);
            if (mark) {
              editor
                .chain()
                .deleteRange({ from: pos, to: pos + node.nodeSize })
                .insertContent(`<a href="${url}">${url}</a>`)
                .run();
              return false;
            }
          }
          return true;
        });
      });
  };

  const editor = useEditor({
    editable: !readingMode,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.extend({
        inclusive: false,
        addAttributes() {
          return {
            ...this.parent?.(),
            'data-marker': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-marker'),
              renderHTML: (attributes) => {
                if (!attributes['data-marker']) return {};
                return { 'data-marker': attributes['data-marker'] };
              },
            },
            'data-image': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-image'),
              renderHTML: (attributes) => {
                if (!attributes['data-image']) return {};
                return { 'data-image': attributes['data-image'] };
              },
            },
            'data-description': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-description'),
              renderHTML: (attributes) => {
                if (!attributes['data-description']) return {};
                return { 'data-description': attributes['data-description'] };
              },
            },
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute('style'),
              renderHTML: (attributes) => {
                if (!attributes.style) return {};
                return { style: attributes.style };
              },
            },
          };
        },
        renderHTML({ HTMLAttributes }) {
          const { 'data-image': dataImage, 'data-description': dataDescription, ...rest } = HTMLAttributes;
          const mergedAttrs = mergeAttributes(this.options.HTMLAttributes, rest, {
            'data-image': dataImage,
            'data-description': dataDescription,
            title: dataDescription || '', // Add description as title attribute for tooltip
          });

          if (dataImage) {
            return [
              'a',
              mergedAttrs,
              [
                'img',
                {
                  src: dataImage,
                  width: '16',
                  height: '16',
                },
              ],
              ['span', 0],
            ];
          }
          return ['a', mergedAttrs, 0];
        },
      }).configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {},
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      ...(enableSlashMenu ? [BubbleMenuExtension] : []),
      FloatingMenuExtension,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn('prose dark:prose-invert max-w-none focus:outline-none min-h-full', 'selection:bg-primary/30'),
        id,
      },
      handlePaste: (_, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text && isUrl(text)) {
          fetchAndUpdateLinkMetadata(text);
          return true;
        }
        return false;
      },
    },
  });

  // Keep editor content in sync with external value
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Update editable state when readingMode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readingMode);
    }
  }, [editor, readingMode]);

  if (!editor) {
    return null;
  }

  const [isLinkEditorOpen, setIsLinkEditorOpen] = React.useState(false);
  const [linkInput, setLinkInput] = React.useState('');

  const handleAIAction = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const fullText = editor.getText();
    if (onAICall) {
      onAICall(selectedText, fullText);
    }
  };

  const setLink = () => {
    // If empty input, remove link
    if (linkInput === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // Add https:// if missing and not a relative/local link
      let url = linkInput;
      if (!/^https?:\/\//i.test(url) && !url.startsWith('/') && !url.startsWith('#')) {
        url = 'https://' + url;
      }

      const { empty } = editor.state.selection;

      if (empty) {
        fetchAndUpdateLinkMetadata(url);
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    }
    setIsLinkEditorOpen(false);
    setLinkInput('');
  };

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkInput(previousUrl || '');
    setIsLinkEditorOpen(true);
  };

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (readingMode) return;
        e.preventDefault();
        handleLinkClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const getMenuButtonClass = (active: boolean) =>
    cn(
      'h-8 w-8 p-0 transition-all duration-200',
      active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent hover:text-accent-foreground',
    );

  return (
    <div
      className={cn(
        'group relative w-full border rounded-md bg-transparent dark:bg-input/30 transition-[color,box-shadow] outline-none shadow-xs',
        'border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] text-sm',
        classNameRoot,
      )}
      style={{ minHeight }}
    >
      {/* Scrollable Content Area */}
      <div
        className={cn('px-3 py-2 h-full', readingMode ? 'cursor-default' : 'cursor-text', classNameEditor)}
        onClick={() => !readingMode && editor.chain().focus().run()}
      >
        {/* Selection Toolbar (Bubble Menu) */}
        {!readingMode && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 150,
              animation: 'shift-away',
              onHidden: () => setIsLinkEditorOpen(false),
            }}
            className="flex items-center gap-0.5 bg-popover/90 backdrop-blur-md border border-border rounded-lg shadow-xl p-1 overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            {isLinkEditorOpen ? (
              <div className="flex items-center gap-1 px-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Paste or type a link..."
                  className="h-7 w-48 text-xs border-none focus-visible:ring-0 bg-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setLink();
                    }
                    if (e.key === 'Escape') {
                      setIsLinkEditorOpen(false);
                    }
                  }}
                />
                <Button type="button" variant="ghost" size="sm" onClick={setLink} className="h-7 w-7 p-0">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsLinkEditorOpen(false)} className="h-7 w-7 p-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={getMenuButtonClass(editor.isActive('bold'))}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={getMenuButtonClass(editor.isActive('italic'))}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={getMenuButtonClass(editor.isActive('underline'))}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleLinkClick} className={getMenuButtonClass(editor.isActive('link'))}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={getMenuButtonClass(editor.isActive('bulletList'))}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                      .toggleBlockquote()
                      .run();
                  }}
                  className={getMenuButtonClass(editor.isActive('blockquote'))}
                >
                  <Quote className="h-4 w-4" />
                </Button>
                {canShowAIOptions && (
                  <>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAIAction}
                      className="h-8 px-2 flex items-center gap-1.5 text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 fill-primary/20 animate-pulse" />
                      <span className="text-xs font-semibold">AI Edit</span>
                    </Button>
                  </>
                )}
              </>
            )}
          </BubbleMenu>
        )}

        {/* Slash Command / Floating Menu */}
        {enableSlashMenu && !readingMode && (
          <FloatingMenu
            editor={editor}
            tippyOptions={{
              duration: 150,
              placement: 'bottom-start',
              offset: [0, 8],
            }}
            shouldShow={({ state }: { state: any }) => {
              const { selection } = state;
              const { $from } = selection;

              // Show only if line is empty OR only contains '/'
              const currentLine = $from.nodeBefore?.text || '';
              const isAtLineStart = $from.parentOffset === 1 && currentLine === '/';

              return isAtLineStart;
            }}
            className="flex flex-col min-w-[180px] bg-popover border border-border rounded-lg shadow-2xl p-1.5 animate-in slide-in-from-top-2 duration-200 z-50"
          >
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</div>

            <SlashMenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                  .toggleHeading({ level: 1 })
                  .run();
              }}
              icon={<Heading1 className="h-4 w-4" />}
              label="Heading 1"
              shortcut="H1"
            />
            <SlashMenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                  .toggleHeading({ level: 2 })
                  .run();
              }}
              icon={<Heading2 className="h-4 w-4" />}
              label="Heading 2"
              shortcut="H2"
            />
            <SlashMenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                  .toggleBulletList()
                  .run();
              }}
              icon={<List className="h-4 w-4" />}
              label="Bullet List"
              shortcut="-"
            />
            <SlashMenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                  .toggleOrderedList()
                  .run();
              }}
              icon={<ListOrdered className="h-4 w-4" />}
              label="Ordered List"
              shortcut="1."
            />
            <SlashMenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                  .toggleBlockquote()
                  .run();
              }}
              icon={<Quote className="h-4 w-4" />}
              label="Quote"
              shortcut=">"
            />

            <SlashMenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                  .run();
                handleLinkClick();
              }}
              icon={<LinkIcon className="h-4 w-4" />}
              label="Hyperlink"
              shortcut="K"
            />

            <Separator className="my-1" />

            {canShowAIOptions && (
              <SlashMenuItem
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                    .run();
                  handleAIAction();
                }}
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                label="AI Assistant"
                className="text-primary hover:bg-primary/10"
              />
            )}
          </FloatingMenu>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

interface SlashMenuItemProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  className?: string;
}

const SlashMenuItem: React.FC<SlashMenuItemProps> = ({ onClick, icon, label, shortcut, className }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className={cn(
      'flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground text-left',
      className,
    )}
  >
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50">{icon}</div>
      <span>{label}</span>
    </div>
    {shortcut && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-medium">{shortcut}</span>}
  </button>
);

export default RichTextEditor;
