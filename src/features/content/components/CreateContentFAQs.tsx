import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Why can't I upload more than 5 pieces of content?",
    answer: "Earn more content purchases and engagement to unlock additional content slots and gain visibility on our discovery page. Higher-performing creators get expanded access to showcase more content."
  },
  {
    question: "Where does my money go when content is purchased?",
    answer: "All earnings are deposited directly into your active wallet configured in the wallet section of your account profile. You have full control over your funds."
  },
  {
    question: "What features are coming soon?",
    answer: "Messaging is launching soon! We're also adding more powerful ways for you to connect with your audience and grow your community."
  },
  {
    question: "Can I remove my content after it's purchased?",
    answer: "Yes, your content belongs to you. As the creator, you retain full control and can remove any content from the platform at any time, even after purchases."
  }
];

export const CreateContentFAQs: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Reset expanded items when collapsing
      setExpandedItems(new Set());
    }
  };

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border border-gray-200/50 dark:border-gray-800/50">
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent group"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            {faqData.map((faq, index) => (
              <div key={index} className="space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-start justify-between p-2 h-auto text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 flex-1 pr-2">
                    {faq.question}
                  </span>
                  {expandedItems.has(index) ? (
                    <ChevronUp className="h-3 w-3 text-gray-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-gray-500 flex-shrink-0 mt-0.5" />
                  )}
                </Button>
                
                {expandedItems.has(index) && (
                  <div className="px-2 pb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};