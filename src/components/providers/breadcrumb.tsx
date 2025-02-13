import React, { createContext, useContext, useState, type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (items: BreadcrumbItem[] | ((prevBreadcrumbs: BreadcrumbItem[]) => BreadcrumbItem[])) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumbs: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setBreadcrumbs: () => {}
});

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);

export function BreadcrumbDisplay() {
  const { breadcrumbs } = useBreadcrumb();

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={`breadcrumb-${index}`}>
            <BreadcrumbItem>
              {item.href
                ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )
                : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
