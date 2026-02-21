import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const mdClassMap = {
  h1: 'text-2xl font-bold text-white mt-6 mb-3 first:mt-0',
  h2: 'text-xl font-semibold text-white mt-5 mb-2',
  h3: 'text-lg font-medium text-white/95 mt-4 mb-2',
  p: 'text-sm leading-relaxed text-white/90 mb-3',
  ul: 'list-disc list-inside text-sm text-white/90 mb-3 space-y-1',
  ol: 'list-decimal list-inside text-sm text-white/90 mb-3 space-y-1',
  li: 'leading-relaxed',
  blockquote: 'border-l-4 border-btn-primary pl-4 my-3 text-white/80 italic',
  code: 'px-1.5 py-0.5 rounded bg-card text-white/95 text-xs font-mono',
  pre: 'rounded-figma bg-card border border-border p-4 overflow-x-auto my-3',
  a: 'text-btn-primary underline hover:opacity-90',
  strong: 'font-semibold text-white',
};

export default function MarkdownView({ content, className = '', editingSection = null }) {
  const generateId = (text) => {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Split content into sections if editing
  const sections = editingSection !== null ? content.split(/(?=^##\s)/m) : [content];
  const isEditingActive = editingSection !== null;

  return (
    <div className={`md-content ${className}`}>
      {sections.map((section, index) => (
        <div key={index} className="relative">
          {isEditingActive && index === editingSection && (
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-btn-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-white">Applying changes...</span>
              </div>
            </div>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => {
                const id = generateId(children);
                return <h1 id={id} className={mdClassMap.h1}>{children}</h1>;
              },
              h2: ({ children }) => {
                const id = generateId(children);
                return <h2 id={id} className={mdClassMap.h2}>{children}</h2>;
              },
              h3: ({ children }) => {
                const id = generateId(children);
                return <h3 id={id} className={mdClassMap.h3}>{children}</h3>;
              },
              p: ({ children }) => <p className={mdClassMap.p}>{children}</p>,
              ul: ({ children }) => <ul className={mdClassMap.ul}>{children}</ul>,
              ol: ({ children }) => <ol className={mdClassMap.ol}>{children}</ol>,
              li: ({ children }) => <li className={mdClassMap.li}>{children}</li>,
              blockquote: ({ children }) => <blockquote className={mdClassMap.blockquote}>{children}</blockquote>,
              code: ({ className: c, children, ...props }) => {
                const isBlock = c?.includes('language-');
                if (isBlock) {
                  return <code className="block text-sm font-mono text-white/95 p-0" {...props}>{children}</code>;
                }
                return <code className={mdClassMap.code} {...props}>{children}</code>;
              },
              pre: ({ children }) => <pre className={mdClassMap.pre}>{children}</pre>,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className={mdClassMap.a}>{children}</a>,
              strong: ({ children }) => <strong className={mdClassMap.strong}>{children}</strong>,
            }}
          >
            {section || ''}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
