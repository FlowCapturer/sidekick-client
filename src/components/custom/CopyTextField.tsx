import { showSuccessToast } from '@/lib';
import { useState } from 'react';
import { Button, Textarea } from '../ui';
import { Check, Copy } from 'lucide-react';

const CopyTextField = ({ copyText }: { copyText: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showSuccessToast({ description: 'Copied to clipboard' });
  };

  return (
    <div className="flex gap-2">
      <Textarea readOnly value={copyText} />
      <Button variant="outline" size="icon" onClick={() => handleCopy(copyText)} className="shrink-0">
        <span className="flex items-center">{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}</span>
      </Button>
    </div>
  );
};

export default CopyTextField;
