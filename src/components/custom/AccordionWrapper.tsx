import type React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface IAccordionWrapperProps {
  title: React.ReactNode | string;
  children: React.ReactNode | string;
}

const AccordionWrapper = ({ title, children }: IAccordionWrapperProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AccordionWrapper;
