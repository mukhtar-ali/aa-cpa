import { useId, useRef } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  FontSize,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  type Plugin,
  RemoveFormat,
  SelectAll,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  TodoList,
  Underline,
  Undo,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import coreTranslationsAr from 'ckeditor5/translations/ar.js'
import { uploadImage } from '@/lib/upload-api'

const DEFAULT_MIN_HEIGHT = '320px'
const DEFAULT_MAX_HEIGHT = '640px'
const TOOLBAR_HEIGHT = 40

export interface RichTextEditorProps {
  value?: string
  onChange: (data: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string
  maxHeight?: string
  language?: 'en' | 'ar'
}

class S3UploadAdapter {
  private loader: { file: Promise<File> }

  constructor(loader: { file: Promise<File> }) {
    this.loader = loader
  }

  async upload() {
    const file = await this.loader.file
    const url = await uploadImage(file)
    return { default: url }
  }

  abort() {
    // Nothing to cancel: uploadImage() has no cancellation token.
  }
}

function S3UploadAdapterPlugin(editor: { plugins: { get: (name: string) => { createUploadAdapter: (loader: { file: Promise<File> }) => S3UploadAdapter } } }) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new S3UploadAdapter(loader)
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxHeight = DEFAULT_MAX_HEIGHT,
  language = 'en',
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorId = useId()

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-md border ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      style={{ minHeight, maxHeight }}
    >
      <CKEditor
        key={`${editorId}-${language}`}
        editor={ClassicEditor}
        config={{
          licenseKey: 'GPL',
          placeholder,
          extraPlugins: [S3UploadAdapterPlugin as unknown as typeof Plugin],
          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Subscript,
            Superscript,
            Code,
            Heading,
            Link,
            List,
            ListProperties,
            TodoList,
            BlockQuote,
            Undo,
            Image,
            ImageCaption,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            Table,
            TableToolbar,
            TableCellProperties,
            TableProperties,
            MediaEmbed,
            HorizontalLine,
            CodeBlock,
            Indent,
            IndentBlock,
            Alignment,
            FontSize,
            SelectAll,
            RemoveFormat,
            SourceEditing,
            Autoformat,
            PasteFromOffice,
            SpecialCharacters,
            SpecialCharactersEssentials,
          ],
          toolbar: [
            'undo', 'redo', '|',
            'sourceEditing', '|',
            'heading', '|',
            'fontSize', '|',
            'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code', '|',
            'alignment', '|',
            'bulletedList', 'numberedList', 'todoList', '|',
            'outdent', 'indent', '|',
            'link', 'uploadImage', 'insertTable', 'mediaEmbed', 'horizontalLine', 'codeBlock', 'specialCharacters', '|',
            'blockQuote', '|',
            'selectAll', '|',
            'removeFormat',
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            ],
          },
          fontSize: {
            options: [9, 10, 11, 12, 'default', 14, 16, 18, 20, 24, 28, 32, 36, 40],
            supportAllValues: true,
          },
          list: {
            properties: { styles: true, startIndex: true, reversed: true },
          },
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
          },
          image: {
            toolbar: [
              'imageTextAlternative',
              '|',
              'imageStyle:inline',
              'imageStyle:wrapText',
              'imageStyle:breakText',
              '|',
              'resizeImage',
              '|',
              'imageCaption',
            ],
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'],
          },
          language: {
            ui: language === 'ar' ? 'ar' : 'en',
            content: language === 'ar' ? 'ar' : 'en',
          },
          translations: language === 'ar' ? [coreTranslationsAr] : undefined,
        }}
        data={value || ''}
        onChange={(_event, editor) => onChange(editor.getData())}
        onReady={(editor) => {
          const container = containerRef.current
          if (!container) return
          const editableHeight = Math.max(container.clientHeight - TOOLBAR_HEIGHT, 200)
          const editableElement = editor.ui.getEditableElement()
          if (editableElement) {
            editableElement.style.minHeight = `${editableHeight}px`
            editableElement.style.height = `${editableHeight}px`
            editableElement.style.maxHeight = `${editableHeight}px`
            editableElement.style.overflow = 'auto'
          }
        }}
        onError={(error, details) => {
          console.error('CKEditor error:', error, details)
        }}
        disabled={disabled}
      />
    </div>
  )
}
