import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTriggerWrapper({
  isCollapsible,
  ...props
}: {
  isCollapsible: boolean;
  children?: React.ReactNode;
} & React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  if (isCollapsible)
    return (
      <CollapsiblePrimitive.CollapsibleTrigger
        data-slot="collapsible-trigger"
        {...props}
      />
    );

  return <>{props.children}</>;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleTriggerWrapper,
  CollapsibleContent,
};
