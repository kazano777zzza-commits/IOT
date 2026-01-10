"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SidebarContext = {
  state: "expanded" | "collapsed"
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open

    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
      isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v)
    }, [isMobile, setOpen, setOpenMobile])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({ state, isMobile, toggleSidebar }),
      [state, isMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div className={cn("flex min-h-svh w-full", className)} ref={ref} {...props}>
            {isMobile && (
              <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetContent
                  side="left"
                  className="w-64 bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
                >
                  {children}
                </SheetContent>
              </Sheet>
            )}
            {!isMobile && children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    collapsible?: "icon" | "offcanvas" | "none"
  }
>(({ collapsible = "icon", className, children, ...props }, ref) => {
  const { state } = useSidebar()
  return (
    <div
      ref={ref}
      data-state={state}
      data-collapsible={collapsible}
      className={cn(
        "bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsible === "icon" && "data-[state=expanded]:w-64 data-[state=collapsed]:w-[5.5rem]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", isMobile && "hidden", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col p-2", className)} {...props} />
  )
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col p-2 mt-auto", className)} {...props} />
  )
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex w-full flex-col gap-1 p-2", className)} {...props} />
  )
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("relative", className)} {...props} />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 overflow-hidden rounded-md p-3 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center group-data-[collapsible=icon]:group-data-[state=collapsed]:p-3 [&>span]:group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0",
  {
    variants: { variant: { default: "" } },
    defaultVariants: { variant: "default" },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state, isMobile } = useSidebar()
  const showTooltip = state === "collapsed" && !isMobile

  const button = (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants(), className)}
      {...props}
    />
  )

  if (!tooltip || !showTooltip) return button

  if (typeof tooltip === "string") tooltip = { children: tooltip }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" {...tooltip} />
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
